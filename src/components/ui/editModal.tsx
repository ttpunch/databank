import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { UpdateData } from "@/actions/actions";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void; 
  itemId: any;
}

interface FormData {
  fieldName: string;
  // Add other fields as necessary
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, itemId }) => {
  const [formData, setFormData] = useState<FormData>({ fieldName: '' });

  useEffect(() => {
    if (isOpen && itemId) {
      const [fetchedData, setFetchedData] = useState<any>(null); // State for storing fetched data
    
      useEffect(() => {
        if (isOpen && itemId) {
          fetchData(); // Fetch data when the modal opens
        }
      }, [isOpen, itemId]);
    
      const fetchData = async () => {
        try {
          const response = await fetch('/api/dataAddition');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setFetchedData(data); // Update state with fetched data
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      // Fetch current data from the database using itemId
    
    }
  }, [isOpen, itemId]);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Update the database with the new data
    await UpdateData(itemId, formData);
    onClose(); // Close the modal after saving
  };

  return (
    isOpen ? (
      <div className="modal">
        <form onSubmit={handleSubmit}>
          {/* Add form fields here */}
          <input name="fieldName" value={formData.fieldName || ''} onChange={handleChange} />
          <Button type="submit">Save</Button>
          <Button onClick={onClose}>Cancel</Button>
        </form>
      </div>
    ) : null
  );
};

export default EditModal;