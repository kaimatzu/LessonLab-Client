import { useState, useEffect, useRef, useContext } from "react";
import { RiDeleteBinLine, RiAddFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
import {
  AdditionalSpecification,
  Specification,
  useWorkspaceMaterialContext,
  Workspace,
} from "@/lib/hooks/context-providers/workspace-material-context";
import "../css/sidenav.css";
import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { POST as uploadFile } from "@/app/api/files/route";
import { FetchedFile } from "@/app/api/files/route";
import {
  POST as _addNewSpecification, DELETE as _deleteCurrentSpecification,
  updateSpecificationName,
  updateSpecificationTopic,
  updateSpecificationWritingLevel,
  updateSpecificationComprehensionLevel,
  fetchAdditionalSpecifications,
  insertAdditionalSpecification,
  updateAdditionalSpecification,
  removeAdditionalSpecification,
} from "@/app/api/material/specification/route"
import { Select, SelectItem, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "../ui-base/select";
import { IsGenerationDisabledContext } from "@/components/material/material";
import { SkeletonLoader } from "../ui-base/skeleton-loader";

interface SidenavMaterialProps {
  workspace: Workspace;
  files: FetchedFile[];
  fetchingFiles: boolean;
  uploadFileCompletionCallback: () => void;
  specifications: Specification[];
  fetchingSpecifications: boolean;
  handleDeleteFile: (documentId: string) => Promise<void>;
}

const SidenavMaterial: React.FC<SidenavMaterialProps> = ({ 
  workspace, 
  files, 
  fetchingFiles, 
  uploadFileCompletionCallback, 
  specifications,
  // fetchingSpecifications,
  handleDeleteFile 
}) => {
  const ctx = useContext(IsGenerationDisabledContext)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { workspaces, workspacesInitialized,
    fetchingSpecifications,
    selectedWorkspace,
    updateSpecification,
    addSpecification,
    deleteSpecification,
    selectedSpecificationId,
    selectSpecification,
    addLessonPage,
    selectPage,
  } = useWorkspaceMaterialContext();

  // File handling
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [popupContent, setPopupContent] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showAddFile, setShowAddFile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Material Specifications
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [writingLevel, setWritingLevel] = useState('Elementary');
  const [comprehensionLevel, setComprehensionLevel] = useState('Simple');
  const [additionalSpecs, setAdditionalSpecs] = useState<AdditionalSpecification[]>([]);
  const [isTopicFocused, setIsTopicFocused] = useState(false);
  const [focusedAdditionalSpecIndex, setFocusedAdditionalSpecIndex] = useState<number | null>(null);
  const [isMaterialSpecificationsInitialized, setIsMaterialSpecificationsInitialized] = useState(false);
  const selectSpecificationRef = useRef<HTMLSelectElement>(null);
  
  // useEffect(() => {
  //   const initializeSpecifications = async () => {
  //     if (!isMaterialSpecificationsInitialized) {
  //       setIsMaterialSpecificationsInitialized(true);
  //       if (selectedWorkspace) {
  //         if (selectedWorkspace.specifications.length > 0) {
  //           // TODO: Change this implementation. selectedSpecificationId must be set here via some local storage value or the 0th index
  //           const spec = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId) || selectedWorkspace.specifications[0];
  //           setName(spec.name);
  //           setTopic(spec.topic);
  //           setWritingLevel(spec.writingLevel);
  //           setComprehensionLevel(spec.comprehensionLevel);
  //           selectSpecification(selectedWorkspace.specifications[0].id)

  //           console.log(selectedSpecificationId)
  //           const data = await fetchAdditionalSpecifications(selectedWorkspace.specifications[0].id);
  //           const additionalSpecifications = data.map((additionalSpec: any) => ({
  //             id: additionalSpec.AdditionalSpecID,
  //             content: additionalSpec.SpecificationText
  //           }));
  //           console.log(additionalSpecifications);
  //           setAdditionalSpecs(additionalSpecifications);
  //         }
  //       }
  //     }
  //   };

  //   initializeSpecifications();
  // }, [isMaterialSpecificationsInitialized, selectedSpecificationId, selectedWorkspace]);

  useEffect(() => {
    console.log("sidenav material mounted")
    console.log(fetchingSpecifications)
    if (!fetchingSpecifications && selectedWorkspace) {
      console.log(selectedWorkspace!.specifications)
      // setName(selectedWorkspace!.specifications[0].name);
      // setTopic(specifications[0].topic);
      // setComprehensionLevel(specifications[0].comprehensionLevel);
      // selectSpecification(specifications[0].id);
    }
  }, [fetchingSpecifications, selectedWorkspace])

  const togglePopup = (content: string) => {
    setPopupContent(popupContent === content ? null : content);
  };

  const toggleDropdown = (buttonId: string) => {
    setActiveDropdown(activeDropdown === buttonId ? null : buttonId);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setActiveDropdown(null);
    }
  };

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
      console.log(selectedFiles[i].name)
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
        // Reset the input field after successful upload
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

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleSpecificationChange = (updatedSpec: Partial<Specification>) => {
    if (selectedWorkspace && selectedSpecificationId) {
      console.log("Update should happen")
      const updatedSpecification: Specification = {
        id: selectedSpecificationId,
        name,
        topic,
        writingLevel,
        comprehensionLevel,
        additionalSpecs,
        ...updatedSpec,
      };

      console.log("Debug ", updatedSpecification);
      updateSpecification(selectedWorkspace.id, updatedSpecification);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  useEffect(() => {
    if (selectedSpecificationId) {
      const specifications = {
        id: selectedSpecificationId,
        name,
        topic,
        writingLevel,
        comprehensionLevel,
        additionalSpecs,
      };
      handleSpecificationChange(specifications);
    }
  }, [name, topic, writingLevel, comprehensionLevel, additionalSpecs]);

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
    const requestBuilder = new RequestBuilder()
      .setBody(JSON.stringify({ MaterialID: selectedWorkspace?.id }))
    const result = await _addNewSpecification(requestBuilder)
    console.log(result)
    const newSpec: Specification = {
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
        const requestBuilder = new RequestBuilder()
          .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/${selectedWorkspace.id}/${selectSpecificationRef.current.value}`)
        const response = await _deleteCurrentSpecification(requestBuilder);
        if (response) {
          deleteSpecification(selectedWorkspace.id, selectSpecificationRef.current.value);
        }
      } else {
        alert('A material must have at least one specification.');
      }
    }
  };

    useEffect(() => {
        const changeSidenavValuesCallback = async () => {
            if (selectedWorkspace && selectedSpecificationId && selectSpecificationRef.current) {
                const selectedSpecification = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId);
                if (selectedSpecification) {
                    setName(selectedSpecification.name);
                    setTopic(selectedSpecification.topic);
                    setWritingLevel(selectedSpecification.writingLevel);
                    setComprehensionLevel(selectedSpecification.comprehensionLevel);
    
                    const data = await fetchAdditionalSpecifications(selectedSpecification.id);
                    const additionalSpecifications = data.map((additionalSpec: any) => ({
                        id: additionalSpec.AdditionalSpecID,
                        content: additionalSpec.SpecificationText
                    }));
                    console.log(additionalSpecifications);
                    setAdditionalSpecs(additionalSpecifications);
                }
                selectSpecificationRef.current.value = selectedSpecificationId
            }
        }

        changeSidenavValuesCallback();
    }, [selectedSpecificationId])



  // Update Additional Specifications
  const handleAdditionalSpecChange = (index: number, value: string) => {
    const newAdditionalSpecs = [...additionalSpecs];
    newAdditionalSpecs[index] = { ...newAdditionalSpecs[index], content: value };
    setAdditionalSpecs(newAdditionalSpecs);
  };

  const handleAdditionalSpecBlur = async (index: number) => {
    const spec = additionalSpecs[index];
    if (spec.content === '') {
      // const isRemoved = await removeAdditionalSpecification(index);
      // if (isRemoved) {
      const newAdditionalSpecs = additionalSpecs.filter((_, i) => i !== index);
      setAdditionalSpecs(newAdditionalSpecs);
    }
    setFocusedAdditionalSpecIndex(null);
  };


  // Insert Additional Specifications
  const addAdditionalSpecField = async () => {
    const result = await insertAdditionalSpecification(additionalSpecs.length, selectedSpecificationId!, additionalSpecs);
    if (result) {
      setAdditionalSpecs([...additionalSpecs, { id: result.newSpecId, content: '' }]);
    }
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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // For generation button ability
  // if one field in the sidenav is empty disable generation button
  useEffect(() => {

    if (topic === '' || name === '') {
      ctx?.setGenerationDisabled(true)
    } else {
      ctx?.setGenerationDisabled(false)
    }

  }, [topic, name])

  return (
    <div className="flex flex-row !w-fit !min-w-fit h-full mr-6 !overflow-x-visible z-[300] dark:bg-zinc-900 shadow-lg no-scrollbar overflow-y-auto">
      <div
        className={`flex flex-col transition-[width] duration-500 ease-in-out ${isCollapsed ? "w-16 max-w-[0px]" : "max-w-[380px] w-[320px] "}`}
      >
        <div className={`text-black mt-2 dark:text-zinc-100`}>
          <div className={`flex align-middle p-3 rounded`}>
            <div className="mr-2"></div>
            <span
              className={`${isCollapsed ? "hidden" : "inline font-medium"}`}
            >
              {workspace.name}
            </span>
          </div>
        </div>

        <div className="border-t border-border my-2"></div>

        <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-lg font-normal transition-none">Files</h1>
            <div className="cursor-pointer" onClick={handleDivClick}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept='text/plain, application/pdf'
                multiple
                onChange={handleFileChange}
              />
              <RiAddFill className="w-6 h-6" />
            </div>
          </div>
          <div
            className={`border-2 border-dashed border-zinc-400 p-4 flex flex-col gap-2 justify-center items-center text-center`}
            // onClick={handleDivClick}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {files.length === 0 && !fetchingFiles && (
              <p className="text-zinc-400">
                No files uploaded yet <br />
                Drag and drop documents here or click to upload
              </p>
            )}

            {isUploading ? (
              <div className="text-zinc-500 text-sm animate-pulse">
                Uploading documents...
              </div>
            ) : (
              <>
                {
                  fetchingFiles ? (
                    <div className="text-zinc-500 text-sm animate-pulse">
                      Fetching documents...
                    </div>) :
                    files.length > 0 ? (
                      <div className="flex flex-col w-full">
                        {files.map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center justify-between bg-zinc-700 text-white rounded p-3 mb-2"
                          >
                            <span className="truncate w-4/5 text-left">
                              {file.name}
                            </span>
                            <RiDeleteBinLine
                              className="text-red-500 cursor-pointer"
                              onClick={() =>
                                handleDeleteFile(
                                  file.documentId
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : ''
                }
              </>)}


          </div>
        </div>

        <div className="border-t border-border my-2"></div>
        
        {/* Specifications */}
        {!fetchingSpecifications ? (
        <>
        {/* Specification Header */}
        <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-lg font-normal">Specifications</h1>
            <div className="flex flex-row justify-end">
              <div className={`${selectSpecificationRef.current?.length === 1 ? '' : 'cursor-pointer'}`}
                onClick={() => {
                  selectSpecificationRef.current?.length === 1 ? {} : deleteCurrentSpecification()
                }}>
                <RiDeleteBinLine className={`${selectSpecificationRef.current?.length === 1 ? 'text-zinc-500' : ''} w-6 h-6`} />
              </div>
              <div className="cursor-pointer" onClick={() => addNewSpecification()}>
                <RiAddFill className="w-6 h-6" />
              </div>
            </div>
          </div>
          {/* Specification Data */}
          <div className="flex flex-col gap-2">
            <div className="text-sm text-zinc-500">Select Specification</div>
            <select className="border border-border rounded focus-visible:outline-ring bg-background p-1 text-sm"
              ref={selectSpecificationRef}
              value={selectedSpecificationId || ''}
              // defaultValue={selectSpecificationRef.current[0]}
              onChange={handleSpecificationSelect}>
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
                onChange={(e) => { setName(e.target.value) }}
                onBlur={(e) => updateSpecificationName(selectedSpecificationId!, e.target.value)}
                onKeyDown={(e) => handleInputKeyDown(e, () => { })}
                placeholder="Specification Name"
              />
            ) : (<></>)}

            <div className="text-sm text-zinc-500">Topic</div>
            <div
              className={`${isTopicFocused ? 'border border-primary' : 'border'
                } border-border p-2 rounded cursor-pointer`}
              onClick={() => setIsTopicFocused(true)}
              onBlur={() => setIsTopicFocused(false)}
            >
              {isTopicFocused ? (
                <textarea
                  className="w-full h-20 p-2 bg-background placeholder-zinc"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onBlur={(e) => updateSpecificationTopic(selectedSpecificationId!, e.target.value)}
                  onKeyDown={(e) => handleTextareaKeyDown(e, () => { })}
                  placeholder="Provide a topic..."
                />
              ) : (
                <span className={`${topic ? '' : 'text-zinc-500'}`}>
                  {topic || 'Provide a topic...'}
                </span>
              )}
            </div>
            <div className="text-sm text-zinc-500">Writing Level</div>
            <select
              className="border border-border p-2 rounded focus-visible:outline-primary bg-background text-sm"
              value={writingLevel}
              onChange={(e) => {
                setWritingLevel(e.target.value)
                updateSpecificationWritingLevel(selectedSpecificationId!, e.target.value);
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
                setComprehensionLevel(e.target.value)
                updateSpecificationComprehensionLevel(selectedSpecificationId!, e.target.value);
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
                className={`${focusedAdditionalSpecIndex === index ? 'border border-yellow-500' : 'border'
                  } border-border p-2 rounded cursor-pointer`}
                onClick={() => setFocusedAdditionalSpecIndex(index)}
                onBlur={() => handleAdditionalSpecBlur(index)}
              >
                {focusedAdditionalSpecIndex === index ? (
                  <textarea
                    className="w-full h-20 p-2"
                    value={spec.content}
                    onChange={(e) => handleAdditionalSpecChange(index, e.target.value)}
                    onBlur={(e) => { e.target.value === '' ? removeAdditionalSpecification(index, additionalSpecs) : updateAdditionalSpecification(index, e.target.value, additionalSpecs) }}
                    onKeyDown={(e) => handleTextareaKeyDown(e, () => { setFocusedAdditionalSpecIndex(null) })}
                    placeholder="Additional specifications..."
                  />
                ) : (
                  <span className={`${spec ? '' : 'text-zinc-400'}`}>
                    {spec.content || 'Additional specifications...'}
                  </span>
                )}
              </div>
            ))}
            <div className="flex flex-row justify-center items-center cursor-pointer rounded mb-1 py-4 hover:bg-yellow-300/80"
              onClick={addAdditionalSpecField}>
              <RiAddFill className="w-6 h-6" />
            </div>
          </div>
        </div>
        </>) : (<SkeletonLoader />)}

        <div className="border-t border-gray-600 my-2"></div>
        
        {selectedWorkspace?.materialType === "LESSON" ? (
            <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
                <div className="flex flex-row justify-between items-center"> 
                    <h1 className="text-lg font-normal">Pages</h1>
                    <div className="cursor-pointer" onClick={() => {addLessonPage(selectedWorkspace.id)}}>
                        <RiAddFill className="w-6 h-6" />
                    </div>
                </div>
                {selectedWorkspace.pages?.map((page, index) => (
                    <div 
                        className="flex items-center justify-between bg-gray-300 rounded p-3 mb-2 cursor-pointer"
                        key={page.id}
                        onClick={() => {selectPage(page.id)}}
                    >
                        {page.id}
                    </div>
                ))}
            </div>
        ) : (
            <>
            </>
        )}
      </div>
    </div>
  );
};

export default SidenavMaterial;
