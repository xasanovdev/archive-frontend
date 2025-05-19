import React, { useEffect, useState } from "react";
import { IDocument } from "../types/document";
import { fetchDocuments } from "../services/document-service";
import DocumentList from "../components/document-list";
import { useSearchParams } from "react-router";
import { Input } from "../components/ui/input";
import { debounce } from "../utils";

const DocumentArchive: React.FC = () => {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");

  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || undefined;

  // Fetch documents when filter or search changes
  useEffect(
    () =>
      debounce(
        "search",
        () => {
          const getDocuments = async () => {
            try {
              setLoading(true);
              const data = await fetchDocuments(filter, search);

              setDocuments(data);
              setError(null);

              const query = {
                ...(filter ? { filter } : {}),
                ...(search ? { search } : {}),
              };

              setSearchParams(query);
            } catch (err) {
              setError("Failed to fetch documents");
              console.error(err);
            } finally {
              setLoading(false);
            }
          };

          getDocuments();
        },
        300
      ),
    [filter, search]
  );

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl whitespace-nowrap font-bold">
            Document Archive
          </h1>

          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm w-full h-12 px-8 !text-lg !rounded-xl"
            placeholder="Search documents..."
          />
        </div>
      </header>

      <main>
        <DocumentList
          documents={documents}
          loading={loading}
          setLoading={setLoading}
        />
      </main>
    </div>
  );
};

export default DocumentArchive;
