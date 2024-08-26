"use client";

import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceContext } from "@/lib/hooks/context-providers/workspace-context";
// import { Workspace } from "@/redux/slices/workspaceSlice";
import Spinner from "@/components/ui/ui-base/spinner";
import { POST as createWorkspace } from "@/app/api/workspace/route";
import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { Workspace } from "@/lib/types/workspace-types";

const validFileTypes = ["application/pdf"];

export default function NewPage() {
  const { addWorkspace } = useWorkspaceContext();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter((file) => validFileTypes.includes(file.type));
      setSelectedFiles(validFiles.length > 0 ? files : null);
      if (validFiles.length === 0) {
        alert("Please select text or PDF files only.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // if (!selectedFiles) {
    //   alert("Please select at least one file.");
    //   return;
    // }

    const formSubmitter = (e.nativeEvent as SubmitEvent).submitter;
    const workspaceType = formSubmitter?.getAttribute("value");

    console.log("Creating:", workspaceType);

    setIsLoading(true);

    const formData = new FormData();
    formData.append("newWorkspace", "true");
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => formData.append("files", file));
    }

    const requestBuilder = new RequestBuilder()
      .setBody(
        JSON.stringify({
          workspaceName: title,
          workspaceType: workspaceType
        })
      );

    try {
      const response = await createWorkspace(requestBuilder).catch(error => {
        console.error("Error creating workspace:", error);
        return null;
      });

      if (response && response.ok) {
        const data = await response.json();
        console.log("Created workspace successfully:", data);

        const newWorkspace: Workspace = {
          id: data.WorkspaceID,
          name: data.WorkspaceName,
          // workspaceType: data.WorkspaceType,
          createdAt: Date.now(),
          fileUrls: [],
          specifications: [{
            id: data.SpecificationID,
            name: '',
            topic: '',
            writingLevel: "Elementary",
            comprehensionLevel: "Simple",
            additionalSpecs: []
          }],
          pages: [],
          chatHistory: []
        };
        addWorkspace(newWorkspace);

        router.push(`/workspace/${data.WorkspaceID}`);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert(`Failed to create workspace. Please try again. ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <div className="w-full max-w-xl rounded-md p-6">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full font-light px-0 py-3 mb-4 text-opacity-75 text-6xl bg-transparent border-gray-200 dark:border-zinc-100 
            rounded-md focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent text-black dark:text-zinc-100 dark:placeholder:text-zinc-100 dark:placeholder:text-opacity-75"
            placeholder="Topic"
          />
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-300 dark:border-zinc-300">
            <span className="text-lg text-gray-400 dark:text-zinc-400">
              {selectedFiles ? `${selectedFiles.length} file(s) selected` : "Add .pdf file(s)..."}
            </span>
            <label
              htmlFor="fileInput"
              className="px-4 py-2 text-primary border-primary/10 border rounded-md 
              hover:bg-[#1b17ff1e] dark:hover:bg-zinc-800 focus:outline-none cursor-pointer"
            >
              Browse
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              disabled={isLoading}
              onChange={handleFileChange}
              style={{ display: "none" }}
              multiple
            />
          </div>
          <div className="mt-4 text-sm font-medium text-primary py-2 mb-5 rounded-lg">
            <p>
              This is a public demo, do not upload private information.
              <br />
            </p>
          </div>
          <div className="flex justify-between gap-4">
            <button
              name="lesson"
              type="submit"
              value="LESSON"
              className="w-full py-3 text-lg font-medium text-zinc-900 bg-primary rounded-md 
            hover:bg-yellow-600 focus:outline-none flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                "Lesson"
              )}
            </button>
            <button
              name="quiz"
              type="submit"
              value="QUIZ"
              className="w-full py-3 text-lg font-medium text-zinc-900 bg-primary rounded-md 
            hover:bg-yellow-600 focus:outline-none flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                "Quiz"
              )}
            </button>
          </div>
          {isLoading && (
            <div className="mt-4 text-sm font-medium text-gray-500 dark:text-zinc-500">
              Upserting and indexing documents... this may take a few minutes....
            </div>
          )}
        </form>
      </div>
    </div>
  );
}