import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IDocument } from "../types/document";
import { getDocumentById } from "../services/document-service";
import DocumentForm from "../components/document-form";

const EditDocument: React.FC = () => {
const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<IDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getDocumentById(id);
        setDocument(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch document");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-red-500 text-center p-4">
        {error || "Document not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Edit Document</h1>
        </div>
      </header>

      <main>
        <DocumentForm initialData={document} isEditMode={true} />
      </main>
    </div>
  );
};

export default EditDocument;
