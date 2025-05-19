import React from "react";
import DocumentForm from "../components/document-form";

const CreateDocument: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Document</h1>
        </div>
      </header>

      <main>
        <DocumentForm />
      </main>
    </div>
  );
};

export default CreateDocument;
