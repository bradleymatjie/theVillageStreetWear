import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';


function getPathFromUrl(url: string): string {
    try {
        // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/storage/v1/object/public/design-assets/');
        if (pathParts.length > 1) {
            return pathParts[1];
        }
        // Fallback: try to extract after 'design-assets/'
        const match = url.match(/design-assets\/(.+)/);
        return match ? match[1] : '';
    } catch (error) {
        console.error('Error parsing URL:', error);
        return '';
    }
}

function extractImageUrlsFromElements(elements: any): string[] {
    const imageUrls: string[] = [];

    if (!elements) return imageUrls;

    ['front', 'back'].forEach((view) => {
        const viewElements = elements[view];
        if (Array.isArray(viewElements)) {
            viewElements.forEach((element: any) => {
                if (element.type === 'image' && element.src) {
                    // Only include URLs that are from Supabase storage
                    if (element.src.includes('design-assets')) {
                        imageUrls.push(element.src);
                    }
                }
            });
        }
    });

    return imageUrls;
}


export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {

    const body = await request.json();
    const { name, elements, tshirt_color, userId } = body;

    if (!name || !elements || !tshirt_color) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('saved_designs')
        .insert({
            user_id: userId,
            name,
            elements,
            tshirt_color,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, elements, tshirt_color } = body;

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('saved_designs')
        .update({ name, elements, tshirt_color, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    return NextResponse.json(data);
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const designId = url.searchParams.get('designId');
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: design, error: fetchError } = await supabase
            .from('saved_designs')
            .select('*')
            .eq('id', designId)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!design) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        // Verify the design belongs to the authenticated user
        if (design.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { error: deleteError } = await supabase
            .from('saved_designs')
            .delete()
            .eq('id', designId)
            .eq('user_id', userId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        const filesToDelete: string[] = [];

        if (design.thumbnail) {
            const thumbnailPath = getPathFromUrl(design.thumbnail);
            if (thumbnailPath) filesToDelete.push(thumbnailPath);
        }

        if (design.design_data && design.design_data.elements) {
            const imageUrls = extractImageUrlsFromElements(design.design_data.elements);
            imageUrls.forEach((url) => {
                const path = getPathFromUrl(url);
                if (path) filesToDelete.push(path);
            });
        }

        if (filesToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('design-assets')
                .remove(filesToDelete);

            if (storageError) {
                console.error('Error deleting storage files:', storageError);
            } else {
                console.log(`Successfully deleted ${filesToDelete.length} file(s) from storage`);
            }
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error in DELETE saved design:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}