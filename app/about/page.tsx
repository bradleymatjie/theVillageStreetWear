// app/about/page.tsx
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Bold & Minimalist */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black z-10" />
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)',
          }} />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6">
            THE VILLAGE
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide uppercase text-gray-300">
            Where Street Culture Meets Expression
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black mb-6 uppercase tracking-tight">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  Born from the streets of Johannesburg, The Village isn't just another streetwear brand. 
                  We're a movement. A collective. A voice for those who dare to stand out.
                </p>
                <p>
                  Founded by Bradley Matjie, we bring you carefully curated pieces that blend 
                  urban aesthetics with bold self-expression. Every drop tells a story. Every piece 
                  makes a statement.
                </p>
                <p className="font-semibold text-white">
                  This is more than fashion. This is culture.
                </p>
              </div>
            </div>
            
            <div className="relative h-[400px] md:h-[500px] bg-white/5 rounded-sm overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white/20 text-9xl font-black">
                 <Image 
                src="/jozi.jpg"
                width={400} 
                height={400} 
                alt="Custom print design" 
                className="w-full h-full object-cover object-bottom"
              />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Full Width */}
      <section className="py-20 px-4 sm:px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black mb-8 uppercase tracking-tight">
            Our Mission
          </h2>
          <p className="text-xl sm:text-2xl leading-relaxed font-light">
            To create a space where individuality thrives. Where every piece empowers you to own your style, 
            tell your story, and rep your city with pride. From the streets of Jozi to the world.
          </p>
        </div>
      </section>

      {/* Custom Prints Callout */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="relative h-[400px] bg-white/5 rounded-sm overflow-hidden order-2 md:order-1">
              <Image 
                src="/leo.png" 
                width={400} 
                height={400} 
                alt="Custom print design" 
                className="w-full h-full object-cover object-bottom"
              />
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-4xl sm:text-5xl font-black mb-6 uppercase tracking-tight">
                Design Your Own
              </h2>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  Got a vision? Bring it to life. At The Village, we don't just sell clothes—we help you 
                  create them. Design your own custom prints and make something that's truly yours.
                </p>
                <p>
                  Whether it's a personal statement, a brand logo, or artwork that speaks to you, 
                  we'll print it on premium blanks and deliver wearable art straight to your door.
                </p>
                <p className="font-semibold text-white">
                  Your idea. Our execution. Limitless possibilities.
                </p>
                <Link 
                  href="/studio" 
                  className="inline-block mt-6 bg-white text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                  Start Creating
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black mb-16 uppercase tracking-tight text-center">
            What We Stand For
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-white/20 p-8 hover:bg-white/5 transition-colors">
              <div className="text-6xl font-black mb-4 text-white/20">01</div>
              <h3 className="text-2xl font-bold mb-3 uppercase">Authenticity</h3>
              <p className="text-gray-400">
                No fake hype. No copied designs. Just real, raw, original streetwear that represents who we are.
              </p>
            </div>
            
            <div className="border border-white/20 p-8 hover:bg-white/5 transition-colors">
              <div className="text-6xl font-black mb-4 text-white/20">02</div>
              <h3 className="text-2xl font-bold mb-3 uppercase">Quality</h3>
              <p className="text-gray-400">
                Premium materials. Attention to detail. Every piece is made to last, not just for the season.
              </p>
            </div>
            
            <div className="border border-white/20 p-8 hover:bg-white/5 transition-colors">
              <div className="text-6xl font-black mb-4 text-white/20">03</div>
              <h3 className="text-2xl font-bold mb-3 uppercase">Creativity</h3>
              <p className="text-gray-400">
                Your vision, your design. We give you the tools to create custom pieces that are uniquely yours.
              </p>
            </div>
            
            <div className="border border-white/20 p-8 hover:bg-white/5 transition-colors">
              <div className="text-6xl font-black mb-4 text-white/20">04</div>
              <h3 className="text-2xl font-bold mb-3 uppercase">Community</h3>
              <p className="text-gray-400">
                The Village is you. It's us. It's everyone who believes in the culture and lives it daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 uppercase tracking-tight">
              Meet the Founder
            </h2>
            <p className="text-gray-400 text-lg">The vision behind The Village</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center text-4xl font-black">
                  BM
                </div>
               <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-2">Bradley Matjie</h3>
                    <p className="text-gray-400 mb-4 uppercase tracking-wide text-sm">Founder & Creative Director</p>
                    <p className="text-gray-300 leading-relaxed">
                        The Village Streetwear is about creating your own style—no rules, no trends dictating your fit. 
                        Jump in and design your own T-shirt: pick bold SA-inspired graphics, tweak the cuts to match your flow.<br/> 
                        It's hands-on, it's yours, from sketch to street. And when you're hunting ready-to-wear? We've got the 
                        brands for us, by us.<br/> Curated drops from local hustlers and collectives—affordable, authentic, and unapologetic.<br/> 
                        Think repurposed fabrics that honor the grind. This ain't retail; it's rebellion. Step up, design up, own the 
                        narrative. What's your first creation?
                    </p>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black mb-8 uppercase tracking-tight">
            Join The Movement
          </h2>
          <p className="text-xl mb-12">
            Got questions? Want to collaborate? Hit us up.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="w-8 h-8 mb-2" />
              <span className="font-semibold">Location</span>
              <span className="text-gray-600">Johannesburg, SA</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Mail className="w-8 h-8 mb-2" />
              <span className="font-semibold">Email</span>
              <Link href="mailto:hello@thevillagestreetwear.com" className="text-gray-600 hover:text-black transition-colors">
                hello@thevillagestreetwear.com
              </Link>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Phone className="w-8 h-8 mb-2" />
              <span className="font-semibold">Phone</span>
              <Link href="tel:+27729509295" className="text-gray-600 hover:text-black transition-colors">
                072 950 9295
              </Link>
            </div>
          </div>
          
          <Link
            href="/products"
            className="inline-block bg-black text-white px-12 py-4 text-lg font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors"
          >
            Shop The Collection
          </Link>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="py-8 px-4 border-t border-white/10 text-center">
        <p className="text-gray-500 uppercase tracking-widest text-sm">
          Est. 2025 • Johannesburg, South Africa • The Village Streetwear
        </p>
      </section>
    </div>
  );
}