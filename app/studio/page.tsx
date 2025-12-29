"use client"
import { useUser } from '../lib/user';
import DesignTools from './components/DesignTools';
import DesignCanvas from './components/DesignCanvas';
import DesignLayers from './components/DesignLayers';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from 'next/navigation';

export default function DesignStudio() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Drawer open={!user} onOpenChange={() => {}}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Login Required</DrawerTitle>
              <DrawerDescription className="text-base mt-4">
                To handle the heavy lifting—storing your designs, images, and other data securely in our database—you need to log in. 
                This allows you to access your work from any device and continue designing seamlessly without losing progress.
              </DrawerDescription>
            </DrawerHeader>

            <Accordion type="single" collapsible className="px-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left text-sm">
                  Why can't we just store everything in the browser?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <p className="mb-4">
                    Without an account, the only way to save your designs would be using your browser's local storage. 
                    It's handy for small amounts of data, but browsers strictly limit it—usually to just 5–10 MB per website.
                  </p>
                  <p>
                    A design tool like this works with images, layers, and detailed projects that can easily grow much larger than that. 
                    Once you hit the limit, you wouldn't be able to save new work, and in some cases you could even lose existing designs if the browser clears space.
                  </p>
                  <p className="mt-4 font-medium">
                    Logging in moves everything to our secure servers: no more storage limits, automatic backups, and your projects are ready wherever you are.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <DrawerFooter className="pt-4">
              <Button
                size="lg"
                className="w-full cursor-pointer"
                onClick={() => {
                  router.push("/login")
                }}
              >
                Log In or Sign Up
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <div
        className={`flex-1 flex flex-col lg:flex-row transition-all duration-300 ${
          !user ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <DesignTools />
        <DesignCanvas />
        <DesignLayers />
      </div>
    </div>
  );
}