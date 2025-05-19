import React, { useEffect, useState } from "react";
import { IDocument } from "../types/document";
import DocumentCard from "./document-card";
import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { fetchTags } from "../services/document-service";
import { ITag } from "../types/tag";

interface DocumentListProps {
  documents: IDocument[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  setLoading,
}) => {
  const [tags, setTags] = useState<ITag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = searchParams.get("filter") || "all";

  const updateFilterQuery = (filter: string) => {
    if (activeFilter === filter) {
      setSearchParams();
      return;
    }

    setSearchParams({ filter });
  };

  useEffect(() => {
    const getTags = async () => {
      try {
        setLoading(true);
        const data = await fetchTags();
        setTags(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch documents");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getTags();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <button className="flex items-center space-x-2 text-lg font-medium">
          <div className="rounded-full border-2 border-black p-1">
            <Plus className="h-6 w-6" />
          </div>
          <span>Fayl yaratish</span>
        </button>

        <Link
          to="/documents/create"
          className="flex items-center space-x-2 text-lg font-medium"
        >
          <div className="border-2 border-black p-1">
            <Plus className="h-6 w-6" />
          </div>
          <span>Yangi hujjatni qo'shish</span>
        </Link>
      </div>

      <div className="flex space-x-2 py-3 mb-4 overflow-x-auto">
        {tags.map((filter) => (
          <button
            key={filter._id}
            className={`px-4 py-2 whitespace-nowrap rounded-full ${
              filter.name == activeFilter
                ? "bg-black text-white"
                : "bg-gray-200 text-black"
            }`}
            onClick={() => updateFilterQuery(filter.name)}
          >
            {filter.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? [...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 shimmer rounded-lg h-48"
              ></div>
            ))
          : documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}

        {documents.length === 0 && !loading && (
          <div className="col-span-4 text-center">
            <h2 className="text-xl font-bold">No documents found</h2>
            <p className="text-gray-500">
              Try changing the filter or search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
