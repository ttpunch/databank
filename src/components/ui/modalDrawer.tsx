import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "../ui/drawer";
import AddDataForm from "@/app/form/AddDataForm";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Adjust the import based on your setup

export default function ModalDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200" onClick={() => setIsOpen(true)}>
          Add Data
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-800 rounded-lg p-6 shadow-lg transition-all duration-300">
        <VisuallyHidden>
          <DrawerTitle>Add Data Form</DrawerTitle>
        </VisuallyHidden>
        <AddDataForm />
        
        <Button onClick={() => setIsOpen(false)} className=" mt-4 bg-red-400 text-white rounded-md hover:bg-gray-600 transition duration-200 ">Close</Button>
      </DrawerContent>
    </Drawer>
  );
}