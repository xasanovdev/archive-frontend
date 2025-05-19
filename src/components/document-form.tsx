import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  Plus,
  Tag,
  Upload,
  User,
  Users,
  Loader2,
  ArrowLeft,
  File,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";

// Define proper types
interface IDocument {
  _id?: string;
  title: string;
  tags: string[];
  performers: string[];
  created_by: string;
  fileName: string;
  fileSize: number;
  expiryDate?: string;
  isBlocked: boolean;
  content?: string;
  filePath?: string;
}

interface DocumentFormProps {
  initialData?: IDocument;
  isEditMode?: boolean;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  initialData,
  isEditMode = false,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"main" | "content">("main");

  // Combined state with proper typing
  const [formState, setFormState] = useState({
    isSubmitting: false,
    isOCRWorking: false,
    filePreview: null as string | null,
    file: null as File | null,
    ocrText: initialData?.content || null,
    filePath: initialData?.filePath || null,
    formData: {
      title: initialData?.title || "",
      tags: initialData?.tags ? initialData.tags.join(", ") : "",
      performers: initialData?.performers
        ? initialData.performers.join(", ")
        : "",
      created_by: initialData?.created_by || "",
      fileName: initialData?.fileName || "",
      fileSize: initialData?.fileSize || 0,
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate).toISOString().split("T")[0]
        : "",
      isBlocked: initialData?.isBlocked || false,
    },
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [name]: value,
        },
      }));
    },
    []
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !e.target.files[0]) return;

      const selectedFile = e.target.files[0];

      setFormState((prev) => ({
        ...prev,
        file: selectedFile,
        formData: {
          ...prev.formData,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
        },
      }));

      // Create a preview for image files
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormState((prev) => ({
            ...prev,
            filePreview: event.target?.result as string,
          }));
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFormState((prev) => ({ ...prev, filePreview: null }));
      }

      await processFileForOCR(selectedFile);
    },
    []
  );

  const processFileForOCR = async (file: File) => {
    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    try {
      setFormState((prev) => ({ ...prev, isOCRWorking: true }));

      const response = await fetch("http://localhost:5000/api/documents/ocr/", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`OCR request failed with status: ${response.status}`);
      }

      const data = await response.json();

      setFormState((prev) => ({
        ...prev,
        ocrText: data.content,
        filePath: data.filePath,
        isOCRWorking: false,
      }));
    } catch (error) {
      console.error("Error processing file for OCR:", error);
      setFormState((prev) => ({ ...prev, isOCRWorking: false }));
    }
  };

  const deleteDocument = async (id?: string) => {
    if (!id) {
      navigate("/");

      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Delete request failed with status: ${response.status}`
        );
      }

      navigate("/");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert(
        `Failed to delete document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Extract tags and performers as arrays
      const tagsArray = formState.formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const performersArray = formState.formData.performers
        .split(",")
        .map((performer) => performer.trim())
        .filter(Boolean);

      const url =
        isEditMode && initialData?._id
          ? `http://localhost:5000/api/documents/${initialData._id}`
          : "http://localhost:5000/api/documents/upload/";

      // Fix: Use proper fetch with headers and JSON.stringify for body
      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState.formData,
          tags: tagsArray,
          performers: performersArray,
          filePath: formState.filePath,
          content: formState.ocrText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Request failed with status: ${response.status}`
        );
      }

      // Navigate back to document list on success
      navigate("/");
    } catch (error) {
      console.error("Error saving document:", error);
      alert(
        `Failed to save document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const toggleBlocked = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        isBlocked: !prev.formData.isBlocked,
      },
    }));
  }, []);

  // Abort any pending requests on unmount
  useEffect(() => {
    const controller = new AbortController();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Update Document" : "Create New Document"}
        </h1>
        {formState.isOCRWorking && (
          <div className="flex items-center space-x-2 text-amber-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>OCR in progress...</span>
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Right Column - Form Fields */}
        <div className="space-y-6 flex flex-col">
          <div className="flex items-center gap-4 w-full">
            <Button
              type="button"
              variant={tab === "main" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTab("main")}
              disabled={formState.isSubmitting}
            >
              Asosiy
            </Button>

            <Button
              variant={tab === "content" ? "default" : "outline"}
              type="button"
              className="flex-1"
              onClick={() => setTab("content")}
              disabled={formState.isSubmitting}
            >
              Kontent
            </Button>
          </div>

          {tab === "main" ? (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="performers"
                  className="flex items-center text-base"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ijrochilar
                </Label>
                <Input
                  id="performers"
                  name="performers"
                  value={formState.formData.performers}
                  onChange={handleInputChange}
                  placeholder="Enter performers (comma separated)"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="created_by"
                  className="flex items-center text-base"
                >
                  <User className="h-4 w-4 mr-2" />
                  Kim tomonidan kiritilmoqda
                </Label>
                <Input
                  id="created_by"
                  name="created_by"
                  value={formState.formData.created_by}
                  onChange={handleInputChange}
                  placeholder="Enter creator name"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fileName"
                  className="flex items-center text-base"
                >
                  <File className="h-4 w-4 mr-2" />
                  Fayl nomi
                </Label>
                <Input
                  id="fileName"
                  name="fileName"
                  value={formState.formData.fileName}
                  onChange={handleInputChange}
                  placeholder="Enter file name"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="expiryDate"
                  className="flex items-center text-base"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Hujjat amal qilish muddati
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  name="expiryDate"
                  value={formState.formData.expiryDate}
                  onChange={handleInputChange}
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="flex items-center text-base">
                  <Tag className="h-4 w-4 mr-2" />
                  Teglar qo'shishi
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formState.formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags (comma separated)"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center text-base">
                  Document Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formState.formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter document title"
                  required
                  disabled={formState.isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isBlocked" className="text-base cursor-pointer">
                  Hujjatni bloklash
                </Label>
                <Switch
                  id="isBlocked"
                  checked={formState.formData.isBlocked}
                  onCheckedChange={toggleBlocked}
                  disabled={formState.isSubmitting}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 grow">
                <p className="font-medium mb-2">Extracted Content:</p>
                <div className="text-sm h-full overflow-y-auto border border-input p-3 rounded-md bg-muted/30">
                  {formState.ocrText}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={() => deleteDocument(initialData?._id)}
              disabled={formState.isSubmitting}
            >
              O'chirish
            </Button>

            <Button
              type="submit"
              variant="outline"
              className="flex-1"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanyapti...
                </>
              ) : (
                "Saqlash"
              )}
            </Button>
          </div>
        </div>

        {/* Left Column - File Upload */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div
                className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center h-96 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={triggerFileInput}
                role="button"
                aria-label="Upload file"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
              >
                {formState.file?.type === "image" ? (
                  <img
                    src={formState.filePreview || formState.filePath}
                    alt="File preview"
                    className="max-h-64 max-w-full object-contain mb-4"
                  />
                ) : formState.file?.type !== "image" ? (
                  <>
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />

                    <p className="text-xl font-medium text-center">WORD, PDF</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-xl font-medium text-center">
                      Upload JPG, WORD, PDF
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click or drag and drop your file here
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
                  aria-label="File input"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="button"
            onClick={triggerFileInput}
            variant={"outline"}
            className="w-full"
            disabled={formState.isSubmitting}
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Faylni tanlash</span>
          </Button>

          <div className="text-sm p-4 border rounded-md bg-muted/30">
            <p>
              <span className="font-medium">File:</span>{" "}
              {formState.formData.fileName}
            </p>
            <p>
              <span className="font-medium">Size:</span>{" "}
              {(formState.formData.fileSize / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
