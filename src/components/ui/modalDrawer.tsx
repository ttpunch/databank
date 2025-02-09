import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "../ui/drawer";
import AddDataForm from "@/app/form/AddDataForm";

export default function ModalDrawer() {
  return (
    <Drawer >
      <DrawerTrigger asChild>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Add</button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Add Data Form</DrawerTitle>
        <AddDataForm />
      </DrawerContent>
    </Drawer>
  );
}