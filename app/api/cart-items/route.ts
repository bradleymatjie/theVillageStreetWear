import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

function getPathFromUrl(url: string): string {
  try {
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

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('Error fetching cart:', error);
        return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { design_name, front_preview, back_preview, elements, tshirt_color, price = 250, user } = body;

    if (!design_name || !front_preview || !back_preview || !elements || !tshirt_color) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if identical design (same color + exact elements JSON) already exists
    const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user?.id)
        .eq('tshirt_color', tshirt_color)
        .eq('elements', elements)
        .single();

    if (existing) {
        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    }

    // Insert new item
    const { data, error } = await supabase
        .from('cart_items')
        .insert({
            user_id: user?.id,
            design_name,
            front_preview,
            back_preview,
            elements,
            tshirt_color,
            price,
            quantity: 1,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');
    const userId = url.searchParams.get('userId');

    debugger;

  try {
    // First, fetch the cart item to get the preview URLs before deletion
    const { data: item, error: fetchError } = await supabase
      .from('cart_items')
      .select('front_preview, back_preview, user_id')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Delete the cart item from database
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Clean up storage files if they exist
    if (item.front_preview || item.back_preview) {
      const filesToDelete: string[] = [];

      if (item.front_preview) {
        const frontPath = getPathFromUrl(item.front_preview);
        if (frontPath) filesToDelete.push(frontPath);
      }

      if (item.back_preview) {
        const backPath = getPathFromUrl(item.back_preview);
        if (backPath) filesToDelete.push(backPath);
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('design-assets')
          .remove(filesToDelete);
        if (storageError) {
          console.error('Error deleting storage files:', storageError);
        }
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE cart item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}