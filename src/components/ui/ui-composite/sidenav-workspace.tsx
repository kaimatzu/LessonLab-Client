import { useState, useEffect, useRef } from "react";
import { RiDeleteBinLine, RiAddFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
import {
  useWorkspaceContext,
} from "@/lib/hooks/context-providers/workspace-context";
import "../css/custom-scrollbar.css";
import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { POST as uploadFile } from "@/app/api/files/route";
import { FetchedFile } from "@/app/api/files/route";
import {
  POST as _addNewSpecification, DELETE as _deleteCurrentSpecification,
  updateSpecificationName as _updateSpecificationName,
  updateSpecificationTopic as _updateSpecificationTopic,
  updateSpecificationWritingLevel as _updateSpecificationWritingLevel,
  updateSpecificationComprehensionLevel as _updateSpecificationComprehensionLevel,
  fetchAdditionalSpecifications as _fetchAdditionalSpecifications,
  insertAdditionalSpecification as _insertAdditionalSpecification,
  updateAdditionalSpecification as _updateAdditionalSpecification,
  removeAdditionalSpecification as _removeAdditionalSpecification,
} from "@/app/api/workspace/specification/route"
import { POST as _addLessonPage } from '@/app/api/workspace/page/route'
import { SkeletonLoader } from "../ui-base/skeleton-loader";
import { Workspace, AdditionalSpecification, Specification } from "@/lib/types/workspace-types";
import { FaRegFilePdf } from "react-icons/fa";
import { IoBookOutline } from "react-icons/io5";
import { LiaUploadSolid } from "react-icons/lia";

interface SidenavWorkspaceProps {
  workspace: Workspace;
  files: FetchedFile[];
  fetchingFiles: boolean;
  uploadFileCompletionCallback: () => void;
  handleDeleteFile: (documentId: string) => Promise<void>;
}

// #region Sidenav Workspace
const SidenavWorkspace: React.FC<SidenavWorkspaceProps> = ({
  workspace,
  files,
  fetchingFiles,
  uploadFileCompletionCallback,
  handleDeleteFile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // #region Workspace Context
  const {
    loading,
    workspaces,
    selectedWorkspace,
    specifications,
    specificationsLoading,
    selectedSpecificationId,
    modules,
    pages,
    updateSpecification,
    updateSpecificationName,
    // updateSpecificationCount,
    addSpecification,
    deleteSpecification,
    selectSpecification,
    selectModule,
    addLessonPage,
    selectPage,
  } = useWorkspaceContext();

  // #region States
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showAddFile, setShowAddFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [numItems, setNumItems] = useState(10)
  const [writingLevel, setWritingLevel] = useState('Elementary');
  const [comprehensionLevel, setComprehensionLevel] = useState('Simple');
  const [additionalSpecs, setAdditionalSpecs] = useState<AdditionalSpecification[]>([]);
  const [focusedAdditionalSpecIndex, setFocusedAdditionalSpecIndex] = useState<number | null>(null);
  const selectSpecificationRef = useRef<HTMLSelectElement>(null);
  const [isTopicFocused, setIsTopicFocused] = useState(false);

  // const updateSpecCount = (value: number) => {
  //   console.log('------> updateSpecCount')
  //   if (!selectedSpecificationId) {
  //     return
  //   }
  //   setNumItems(value)
  //   if (!selectedWorkspace?.specifications) {
  //     return
  //   }
  //   console.log('------> Pass null checks')
  //   setNumItems(value)
  //   updateSpecificationCount(selectedWorkspace.id, selectedSpecificationId, value)
  // }

  // #region File Handling
  ////////////////////////////////////
  ////////////File Handling///////////
  ////////////////////////////////////

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) => file.type === 'text/plain' || file.type === 'application/pdf'
      );
      if (validFiles.length > 0) {
        handleUpload(validFiles);
      } else {
        alert('Please select text or PDF files only.');
      }
    }
  };

  const handleUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('namespaceId', workspace.id);

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
      console.log(selectedFiles[i].name);
    }

    const request = new RequestBuilder().setBody(formData);

    try {
      const response = await uploadFile(request).catch(error => {
        console.error("Error uploading files:", error);
        return null;
      });

      if (response) {
        const data = await response.json();
        console.log("Files uploaded successfully:", data);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }

    setIsUploading(false);
    uploadFileCompletionCallback();
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setShowAddFile(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setShowAddFile(true);
  };

  const handleDragLeave = () => {
    setShowAddFile(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setShowAddFile(false);
    const files = Array.from(event.dataTransfer.files).filter(
      (file) => file.type === 'text/plain' || file.type === 'application/pdf'
    );
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  useEffect(() => {
    const handleGlobalDragOver = (event: DragEvent) => {
      event.preventDefault();
      setShowAddFile(true);
    };

    const handleGlobalDragEnter = (event: DragEvent) => {
      event.preventDefault();
      setShowAddFile(true);
    };

    const handleGlobalDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) {
        setShowAddFile(false);
      }
    };

    window.addEventListener("dragover", handleGlobalDragOver);
    window.addEventListener("dragenter", handleGlobalDragEnter);
    window.addEventListener("dragleave", handleGlobalDragLeave);

    return () => {
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("dragenter", handleGlobalDragEnter);
      window.removeEventListener("dragleave", handleGlobalDragLeave);
    };
  }, []);

  // #region Workspace Notifications
  ////////////////////////////////////
  ///////Workspace Specifications//////
  ////////////////////////////////////

  const handleSpecificationSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    selectSpecification(event.target.value);
  };

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>, blurCallback: () => void) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      blurCallback();
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, blurCallback: () => void) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      blurCallback();
    }
  };

  const addNewSpecification = async () => {
    if (!selectedWorkspace) {
      return;
    }
    const requestBuilder = new RequestBuilder().setBody(JSON.stringify({ WorkspaceID: selectedWorkspace.id }));
    const result = await _addNewSpecification(requestBuilder);

    const newSpec: Specification =  {
      id: result.SpecificationID,
      name: '',
      topic: '',
      writingLevel: 'Elementary',
      comprehensionLevel: 'Simple',
      additionalSpecs: [],
    };
    addSpecification(selectedWorkspace.id, newSpec);
  };

  const deleteCurrentSpecification = async () => {
    if (selectedWorkspace && selectedSpecificationId && selectSpecificationRef.current) {
      if (selectedWorkspace.specifications.length > 1) {
        const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/specifications/${selectedWorkspace.id}/${selectSpecificationRef.current.value}`);
        const response = await _deleteCurrentSpecification(requestBuilder);
        if (response) {
          deleteSpecification(selectedWorkspace.id, selectSpecificationRef.current.value);
        }
      } else {
        alert('A workspace must have at least one specification.');
      }
    }
  };

  useEffect(() => {
    const initializeSpecification = async (spec: Specification) => {
      setName(spec.name);
      setTopic(spec.topic);
      setWritingLevel(spec.writingLevel);
      setComprehensionLevel(spec.comprehensionLevel);

      const data = await _fetchAdditionalSpecifications(spec.id);
      const additionalSpecifications = data.map((additionalSpec: any) => ({
        id: additionalSpec.AdditionalSpecID,
        content: additionalSpec.SpecificationText,
      }));
      console.log(additionalSpecifications)
      setAdditionalSpecs(additionalSpecifications);
    };

    if (!specificationsLoading && specifications && specifications.length > 0) {
      const specToLoad = selectedSpecificationId
        ? specifications.find(spec => spec.id === selectedSpecificationId)
        : specifications[0];

      if (specToLoad) {
        selectSpecification(specToLoad.id);
        initializeSpecification(specToLoad);
      } else {
        selectSpecification(specifications[0].id);
        initializeSpecification(specifications[0]);
        // updateSpecCount(10)
      }
    }
  }, [specificationsLoading, specifications, selectedSpecificationId]);

  const handleAdditionalSpecChange = (index: number, value: string) => {
    const newAdditionalSpecs = [...additionalSpecs];
    newAdditionalSpecs[index] = { ...newAdditionalSpecs[index], content: value };
    setAdditionalSpecs(newAdditionalSpecs);
  };

  const handleAdditionalSpecBlur = async (index: number) => {
    const spec = additionalSpecs[index];
    if (spec.content === '') {
      const newAdditionalSpecs = additionalSpecs.filter((_, i) => i !== index);
      setAdditionalSpecs(newAdditionalSpecs);
    }
    setFocusedAdditionalSpecIndex(null);
  };

  const addAdditionalSpecField = async () => {
    const result = await _insertAdditionalSpecification(additionalSpecs.length, selectedSpecificationId!, additionalSpecs);
    if (result) {
      setAdditionalSpecs([...additionalSpecs, { id: result.newSpecId, content: '' }]);
    }
  };

  // #region Lesson Pages
  ////////////////////////////////////
  /////////////Lesson Pages///////////
  ////////////////////////////////////

  const createLessonPage = async () => {
    if (selectedWorkspace
      // && selectedWorkspace.workspaceType === 'LESSON'
    ) {
      const requestBuilder = new RequestBuilder()
        .setBody(JSON.stringify({
          LessonID: selectedWorkspace.id,
          LastPageID: null
        }))
      const result = await _addLessonPage(requestBuilder);
      const data = await result.json();

      addLessonPage(selectedWorkspace.id, {
        id: data.PageID,
        title: data.Title || 'Untitled',
        content: data.Content || '',
      });
    }
  }


  // #region JSX
  return (
    <div className="flex flex-col !w-fit !min-w-fit h-full !overflow-x-visible bg-[#F1F3F8] border-r border-gray-300 dark:bg-zinc-900 no-scrollbar overflow-y-auto">
      {/* <div className={`flex flex-col transition-[width] duration-500 ease-in-out ${isCollapsed ? "w-16 max-w-[0px]" : "max-w-[340px] w-[300px] "}`}> */}
        {/* <div className="border-t border-border my-2"></div> */}
      <div className={`flex flex-col h-full transition-[width] duration-500 ease-in-out ${isCollapsed ? "w-16 max-w-[0px]" : "max-w-[320px] w-[250px] "}`}>
        <div className="flex flex-col border-b border-gray-300 flex-1 overflow-y-auto">
          <div className="flex flex-row justify-between items-center p-1 py-3 border-b border-gray-300">
            <h1 className="text-sm font-normal transition-none ml-4">Files</h1>
            <div className="cursor-pointer mr-4" onClick={handleDivClick}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="text/plain, application/pdf"
                multiple
                onChange={handleFileChange}
              />
              <LiaUploadSolid className="w-4 h-4 hover:text-[#5e77d3]"/>
            </div>
          </div>

          {/* <div className="w-full border-t border-gray-300"></div> */}

          <div
            className={`flex flex-col min-w-[50%] justify-center items-center text-center`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {files.length === 0 && !fetchingFiles && (
              <p className="text-zinc-400 select-none cursor-default mt-3">
                No files uploaded yet 
              </p>
            )}

            {isUploading ? (
              <div className="text-zinc-500 text-sm animate-pulse select-none cursor-default mt-3">
                Uploading documents...
              </div>
            ) : (
              <>
                {fetchingFiles ? (
                  <div className="text-zinc-500 text-sm animate-pulse select-none cursor-default mt-3">
                    Fetching documents...
                  </div>
                ) : (
                  files.length > 0 && (
                    <div className="flex flex-col w-full text-sm">
                      {files.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center text-sm justify-between hover:bg-[#E2E4EA] cursor-pointer text-zinc-900 p-2 rounded-md my-0.5 mx-1.5"
                        >
                          <FaRegFilePdf />
                          <span className="truncate w-4/5 text-left">
                            {file.name}
                          </span>
                          <RiDeleteBinLine
                            className="text-zinc-900 cursor-pointer mr-3"
                            onClick={() => handleDeleteFile(file.documentId)}
                          />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
        {/* <div className="border-t border-border my-2"></div> */}
{/* 
        {!specificationsLoading ? (
          <>
            <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-lg font-normal">Specifications</h1>
                <div className="flex flex-row justify-end">
                  <div
                    className={`${selectSpecificationRef.current?.length === 1 ? '' : 'cursor-pointer'}`}
                    onClick={() => {
                      selectSpecificationRef.current?.length === 1 ? {} : deleteCurrentSpecification();
                    }}
                  >
                    <RiDeleteBinLine className={`${selectSpecificationRef.current?.length === 1 ? 'text-zinc-500' : ''} w-6 h-6`} />
                  </div>
                  <div className="cursor-pointer" onClick={() => addNewSpecification()}>
                    <RiAddFill className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-zinc-500">Select Specification</div>
                <select
                  className="border border-border rounded focus-visible:outline-ring bg-background p-1 text-sm"
                  ref={selectSpecificationRef}
                  value={selectedSpecificationId || ''}
                  onChange={handleSpecificationSelect}
                >
                  {specifications.map((spec) => (
                    <option className="truncate w-4/5 text-left" key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-zinc-500">Specification Name</div>
                {name !== null ? (
                  <input
                    type="text"
                    className="border border-border p-2 rounded focus-visible:outline-ring bg-background placeholder-zinc-500 text-sm"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (selectedWorkspace && selectedWorkspace.id && selectedSpecificationId) {
                        updateSpecificationName(selectedWorkspace.id, selectedSpecificationId, e.target.value);
                      } else {
                        console.log(selectedWorkspace, selectedSpecificationId)
                      }
                    }}
                    onBlur={(e) => { _updateSpecificationName(selectedSpecificationId!, e.target.value) }}
                    onKeyDown={(e) => handleInputKeyDown(e, () => { })}
                    placeholder="Specification Name"
                  />
                ) : (
                  <></>
                )}
                {
                  // workspace.workspaceType === 'QUIZ' ?
                  //   <>
                  //     <div className="text-sm text-zinc-500">Number of Items</div>
                  //     <input
                  //       type='number'
                  //       className="border border-border p-2 rounded focus-visible:outline-ring bg-background placeholder-zinc-500 text-sm"
                  //       value={numItems}
                  //       onChange={e => {
                  //         const value = parseInt(e.target.value)
                  //         if (value < 1) {
                  //           return
                  //         }
                  //         setNumItems(value)

                  //         // TODO: redux here
                  //         if (selectedWorkspace && selectedSpecificationId) {
                  //           updateSpecificationCount(selectedWorkspace.id, selectedSpecificationId, value)
                  //         }

                  //         // workspace.specifications.map(specification => {
                  //         //   if (specification.id === selectedSpecificationId) {
                  //         //     specification = {
                  //         //       ...specification,
                  //         //       numItems: value,
                  //         //     }
                  //         //   }
                  //         // })
                  //       }}
                  //     />
                  //   </>
                  //   : null
                }
                <div className="text-sm text-zinc-500">Topic</div>
                <div
                  className={`${isTopicFocused ? 'border border-primary' : 'border'} border-border p-2 rounded cursor-pointer`}
                  onClick={() => setIsTopicFocused(true)}
                  onBlur={() => setIsTopicFocused(false)}
                >
                  {/* TODO: Update the redux state for topic */}
                  {/* {isTopicFocused ? (
                    <textarea
                      className="w-full h-20 p-2 bg-background placeholder-zinc"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onBlur={(e) => _updateSpecificationTopic(selectedSpecificationId!, e.target.value)}
                      onKeyDown={(e) => handleTextareaKeyDown(e, () => { })}
                      placeholder="Provide a topic..."
                    />
                  ) : (
                    <span className={`${topic ? '' : 'text-zinc-500'}`}>{topic || 'Provide a topic...'}</span>
                  )}
                </div>
                <div className="text-sm text-zinc-500">Writing Level</div>
                <select
                  className="border border-border p-2 rounded focus-visible:outline-primary bg-background text-sm"
                  value={writingLevel}
                  onChange={(e) => {
                    setWritingLevel(e.target.value);
                    _updateSpecificationWritingLevel(selectedSpecificationId!, e.target.value);
                  }}
                >
                  <option>Elementary</option>
                  <option>High-school</option>
                  <option>College</option>
                  <option>Professional</option>
                </select>
                <div className="text-sm text-zinc-500">Comprehension Level</div>
                <select
                  className="border border-border p-2 rounded focus-visible:outline-primary bg-background text-sm"
                  value={comprehensionLevel}
                  onChange={(e) => {
                    setComprehensionLevel(e.target.value);
                    _updateSpecificationComprehensionLevel(selectedSpecificationId!, e.target.value);
                  }}
                >
                  <option className="border-border">Simple</option>
                  <option className="border-border">Standard</option>
                  <option className="border-border">Comprehensive</option>
                </select>
                <div className="text-sm text-zinc-500">Additional Specifications</div>
                {additionalSpecs.map((spec, index) => (
                  <div
                    key={index}
                    className={`${focusedAdditionalSpecIndex === index ? 'border border-yellow-500' : 'border'} border-border p-2 rounded cursor-pointer`}
                    onClick={() => setFocusedAdditionalSpecIndex(index)}
                    onBlur={() => handleAdditionalSpecBlur(index)}
                  >
                    {focusedAdditionalSpecIndex === index ? (
                      <textarea
                        className="w-full h-20 p-2"
                        value={spec.content}
                        onChange={(e) => handleAdditionalSpecChange(index, e.target.value)}
                        onBlur={(e) => {
                          e.target.value === '' ? _removeAdditionalSpecification(index, additionalSpecs) : _updateAdditionalSpecification(index, e.target.value, additionalSpecs);
                        }}
                        onKeyDown={(e) => handleTextareaKeyDown(e, () => setFocusedAdditionalSpecIndex(null))}
                        placeholder="Additional specifications..."
                      />
                    ) : (
                      <span className={`${spec ? '' : 'text-zinc-400'}`}>{spec.content || 'Additional specifications...'}</span>
                    )}
                  </div>
                ))}
                <div
                  className="flex flex-row justify-center items-center cursor-pointer rounded mb-1 py-4 hover:bg-yellow-300/80"
                  onClick={addAdditionalSpecField}
                >
                  <RiAddFill className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-600 my-2"></div>

            {selectedWorkspace ? (
              <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
                <div className="flex flex-row justify-between items-center">
                  <h1 className="text-lg font-normal">Pages</h1>
                  <div className="cursor-pointer" onClick={createLessonPage}>
                    <RiAddFill className="w-6 h-6" />
                  </div>
                </div>
                {pages?.map((page) => (
=======
        {/* <div className="border-t border-border"></div> */}
        
        
          <div className="flex flex-row justify-between items-center p-1 py-3 border-b border-gray-300">
                <h1 className="text-sm font-normal transition-none ml-4">Modules</h1>
                <div className="cursor-pointer mr-4" onClick={() => {}}>
                  <RiAddFill className="w-4 h-4" />
                </div>
            </div>
          <div className="flex flex-col border-b border-gray-300 flex-1 custom-scrollbar overflow-y-auto">
          {selectedWorkspace ? (
                <div className="flex flex-col min-w-[50%] justify-start">
                  {modules?.map((module) => (
                    <div
                      className="flex items-center text-sm justify-start hover:bg-[#E2E4EA] cursor-pointer p-2 rounded-md my-0.5 mx-1.5"
                      key={module.id}
                      onClick={() => selectModule(module.id)}
                    >
                      <IoBookOutline className="mr-2 w-4 h-4"/>
                      <span className="truncate w-[200px]">{module.name}</span>
                    </div>
                  ))}
                </div>
          ) : (null)}
          </div>
      </div>
    </div >
  );
};

export default SidenavWorkspace;
