import { IDocument } from "../types/document";

export const fetchDocuments = (
  filter?: string,
  search?: string
): Promise<IDocument[]> => {
  return new Promise((resolve) => {
    const query = new URLSearchParams();

    if (filter) {
      query.set("tag", filter);
    }

    if (search) {
      query.set("search", search);
    }

    const data = fetch(
      `http://localhost:5000/api/documents?${query.toString()}`
    );

    data
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((documents: IDocument[]) => {
        resolve(documents);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
        resolve([]);
      });
  });
};

export const fetchTags = (): Promise<any> => {
  return new Promise((resolve) => {
    const data = fetch("http://localhost:5000/api/tags");

    data
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((tags) => {
        resolve(tags);
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
        resolve([]);
      });
  });
};

export const getDocumentById = async (
  id: string
): Promise<IDocument | null> => {
  try {
    const response = await fetch(`http://localhost:5000/api/documents/${id}`);
    if (!response.ok) throw new Error("Failed to fetch document");
    const document: IDocument = await response.json();
    return document;
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    return null;
  }
};

export const createDocument = async (
  formData: FormData
): Promise<IDocument | null> => {
  try {
    const response = await fetch("http://localhost:5000/api/documents", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to create document");
    const newDocument: IDocument = await response.json();
    return newDocument;
  } catch (error) {
    console.error("Error creating document:", error);
    return null;
  }
};

export const updateDocument = async (
  id: string,
  formData: FormData
): Promise<IDocument | null> => {
  try {
    const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update document");
    const updatedDocument: IDocument = await response.json();
    return updatedDocument;
  } catch (error) {
    console.error("Error updating document:", error);
    return null;
  }
};
