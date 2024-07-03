import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TbNotes, TbBook, TbPencil } from "react-icons/tb";
import { FaPlus, FaLock } from "react-icons/fa";
import { RiDeleteBinLine, RiAddFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
import {
    AdditionalSpecification,
    Specification,
    useWorkspaceMaterialContext,
    Workspace,
} from "@/lib/hooks/context-providers/workspace-material-context";
import { SkeletonLoader } from "../ui-base/skeleton-loader";
import { Tooltip } from "./tooltip";
import "../css/sidenav.css";
import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { POST as uploadFile } from "@/app/api/files/route";
import { FetchedFile } from "@/app/api/files/route";
import { v4 as uuidv4 } from "uuid";

interface SidenavMaterialProps {
    workspace: Workspace;
    files: FetchedFile[];
    fetchingFiles: boolean;
    uploadCompletionCallback: () => void;
    handleDeleteFile: (documentId: string) => Promise<void>;
}

const SidenavMaterial: React.FC<SidenavMaterialProps> = ({ workspace, files, fetchingFiles, uploadCompletionCallback, handleDeleteFile }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { workspaces, workspacesInitialized, 
        selectedWorkspace,
        updateSpecification,
        addSpecification,
        deleteSpecification,    
        getSpecifications, 
        selectedSpecificationId,
        selectSpecification,
    } = useWorkspaceMaterialContext();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [popupContent, setPopupContent] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [showAddFile, setShowAddFile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [materialSpecifications, setMaterialSpecifications] = useState<Specification[]>([]);
    const [selectedSpecificationIndex, setSelectedSpecificationIndex] = useState(0);
    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');
    const [writingLevel, setWritingLevel] = useState('Elementary');
    const [comprehensionLevel, setComprehensionLevel] = useState('Simple');
    const [additionalSpecs, setAdditionalSpecs] = useState<AdditionalSpecification[]>([]);
    const [isTopicFocused, setIsTopicFocused] = useState(false);
    const [focusedAdditionalSpecIndex, setFocusedAdditionalSpecIndex] = useState<number | null>(null);
    const [isMaterialSpecificationsInitialized, setIsMaterialSpecificationsInitialized] = useState(false);
    const selectSpecificationRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        const initializeSpecifications = async () => {
        if (!isMaterialSpecificationsInitialized) {
            setIsMaterialSpecificationsInitialized(true);
            if (selectedWorkspace) {
                if (selectedWorkspace.specifications.length > 0) {
                    // TODO: Change this implementation. selectedSpecificationId must be set here via some local storage value or the 0th index
                    const spec = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId) || selectedWorkspace.specifications[0];
                    setName(spec.name);
                    setTopic(spec.topic);
                    setWritingLevel(spec.writingLevel);
                    setComprehensionLevel(spec.comprehensionLevel);
                    selectSpecification(selectedWorkspace.specifications[0].id)
                    
                    const data = await fetchAdditionalSpecifications();
                    const additionalSpecifications = data.map((additionalSpec: any) => ({
                        id: additionalSpec.AdditionalSpecID,
                        content: additionalSpec.SpecificationText
                    }));
                    console.log(additionalSpecifications);
                    setAdditionalSpecs(additionalSpecifications);
                }
            }
        }
        };
      
        initializeSpecifications();
    }, [isMaterialSpecificationsInitialized, selectedSpecificationId, selectedWorkspace]);

      
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
        uploadCompletionCallback();
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
        const index = event.target.selectedIndex;
        console.log("Spec index: ", index);
        console.log("Material specs set: ", materialSpecifications)
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

    const _addNewSpecification = async () => {
        const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications`)
            .setMethod("POST")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify({ MaterialID: selectedWorkspace?.id }))
            .setCredentials("include")
        try {
            const response = await fetch(requestBuilder.build());
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Error inserting specification:', error);
        }
    };


    // TODO: Make this call the backend
    const addNewSpecification = async () => { 
        if (!selectedWorkspace) {
            return;
        }
        const result = await _addNewSpecification()
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

        // setName('')
        // setTopic('');
        // setWritingLevel('Elementary');
        // setComprehensionLevel('Simple');
        // setAdditionalSpecs([]);
        
        // if (selectSpecificationRef.current) {
        //     // selectSpecificationRef.current.selectedIndex = selectedWorkspace.specifications.length - 1 
            
        //     console.log("Inside add new specification")
        //     console.log("Selected index: ", selectedSpecificationIndex)
        //     console.log("Selected ref index: ", selectSpecificationRef.current.selectedIndex)
        //     console.log("Selected ref length: ", selectSpecificationRef.current.length)
        //     console.log("Current workspace spec array length: ", selectedWorkspace.specifications.length)

        //     setSelectedSpecificationIndex(selectedWorkspace.specifications.length)
        // }
        // if (selectedWorkspace) {
        //     updateSpecification(selectedWorkspace.id, newSpec)
        // }
    };

    useEffect(() => {
        if (selectedWorkspace && selectSpecificationRef.current) {
            // selectSpecificationRef.current.selectedIndex = selectedSpecificationIndex;
            // selectSpecificationRef.current.value = 
            console.log("Inside use effect")
            console.log("Selected index: ", selectedSpecificationIndex)
            console.log("Selected ref index: ", selectSpecificationRef.current.selectedIndex)
            console.log("Selected ref length: ", selectSpecificationRef.current.length)
        }
    }, [selectedSpecificationIndex])

    useEffect(() => {
        if (selectedWorkspace && selectedSpecificationId && selectSpecificationRef.current) {
            const selectedSpecification = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId);
            if (selectedSpecification) {
                setName(selectedSpecification.name);
                setTopic(selectedSpecification.topic);
                setWritingLevel(selectedSpecification.writingLevel);
                setComprehensionLevel(selectedSpecification.comprehensionLevel);
                setAdditionalSpecs(selectedSpecification.additionalSpecs);
            }
            selectSpecificationRef.current.value = selectedSpecificationId
            console.log("Updated ", selectedWorkspace?.specifications);
            console.log("Spec id Updated ", selectedSpecificationId);
        }
    }, [selectedSpecificationId])
    
    // // TODO: Make this call the backend
    // const deleteSpec = (specId: string) => {
    // if (workspace.specifications.length > 1) {
    //     deleteSpecification(workspace.id, specId);
    // } else {
    //     alert('A material must have at least one specification.');
    // }
    // };

    const updateSpecificationName = async (name: string) => {
        const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/name`)
            .setMethod("PATCH")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, Name: name }))
            .setCredentials("include")

        try {
            await fetch(requestBuilder.build());
        } catch (error) {
            console.error('Error updating specification name:', error);
        }
    };

    const updateSpecificationTopic = async (topic: string) => {
        const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/topic`)
            .setMethod("PATCH")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, Topic: topic }))
            .setCredentials("include")
        try {
            await fetch(requestBuilder.build());
        } catch (error) {
            console.error('Error updating specification topic:', error);
        }
    };

    const updateSpecificationComprehensionLevel = async (comprehensionLevel: string) => {
        const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/comprehensionlevel`)
            .setMethod("PATCH")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, ComprehensionLevel: comprehensionLevel }))
            .setCredentials("include")
        try {
            await fetch(requestBuilder.build());
        } catch (error) {
            console.error('Error updating specification comprehension level:', error);
        }
    };

    const updateSpecificationWritingLevel = async (writingLevel: string) => {
        const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/update/writinglevel`)
            .setMethod("PATCH")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify({ SpecificationID: selectedSpecificationId, WritingLevel: writingLevel }))
            .setCredentials("include")
        try {
            await fetch(requestBuilder.build());
        } catch (error) {
            console.error('Error updating specification writing level:', error);
        }
    };

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
        const result = await insertAdditionalSpecification(additionalSpecs.length);
        if (result) {
            setAdditionalSpecs([...additionalSpecs, { id: result.newSpecId, content: '' }]);
        }
    };
        
    const insertAdditionalSpecification = async (index: number) => {
        const additionalSpec = additionalSpecs[index];
        try {
          const requestBody = {
            SpecificationID: selectedSpecificationId,
            LastAdditionalSpecificationID: additionalSpec ? additionalSpec.id || null : null
          };
      
          const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications`)
            .setMethod("POST")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify(requestBody))
            .setCredentials("include");
      
          const response = await fetch(requestBuilder.build());
          
          if(response.ok) {
              const result = await response.json();
              return result;
          } else {
            console.error('Error inserting additional specification:', response.statusText);
          }
        } catch (error) {
          console.error('Error inserting additional specification:', error);
        }
    };

    const fetchAdditionalSpecifications = async () => {
        try {
          const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications/${selectedSpecificationId}`)
            .setMethod("GET")
            .setCredentials("include");
      
          const response = await fetch(requestBuilder.build());
      
          if (response.ok) {
            const data = await response.json();

            console.log(data)
            return data.additionalSpecifications;
          } else {
            console.error('Error fetching additional specifications:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching additional specifications:', error);
        }
    };
      
    const updateAdditionalSpecification = async (index: number, SpecificationText: string) => {
        const additionalSpec = additionalSpecs[index];
        console.log("Update called", additionalSpecs)
        try {
          const requestBody = {
            AdditionalSpecID: additionalSpec.id,
            SpecificationText: SpecificationText,
          };
      
          const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications`)
            .setMethod("PATCH")
            .setHeaders({ 'Content-Type': 'application/json' })
            .setBody(JSON.stringify(requestBody))
            .setCredentials("include");
      
          const response = await fetch(requestBuilder.build());
          
          if(response.ok) {
              const result = await response.json();
              return result;
          } else {
            console.error('Error updating additional specification:', response.statusText);
          }
        } catch (error) {
          console.error('Error updating additional specification:', error);
        }
    };

    const removeAdditionalSpecification = async (index: number) => {
        const additionalSpec = additionalSpecs[index];
        console.log("Delete called")

        const requestBuilder = new RequestBuilder()
            .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/additionalspecifications/${additionalSpec.id}`)
            .setMethod("DELETE")
            .setCredentials("include");
    
        try {
            const response = await fetch(requestBuilder.build());
            if (response.ok) {
                return true;
            } else {
                console.error('Error removing additional specification:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error removing additional specification:', error);
            return false;
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

    return (
        <div className="flex flex-row !w-fit !min-w-fit h-full !overflow-x-visible z-[300] dark:bg-zinc-900 shadow-lg no-scrollbar overflow-y-auto">
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

                <div className="border-t border-gray-600 my-2"></div>

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
                        className={`border-2 border-dashed border-gray-400 p-4 flex flex-col gap-2 justify-center items-center text-center`}
                        // onClick={handleDivClick}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {files.length === 0 && !fetchingFiles && (
                            <p className="text-gray-400">
                                No files uploaded yet <br />
                                Drag and drop documents here or click to upload
                            </p>
                        )}

                        { isUploading ? (
                            <div className="text-gray-500 text-sm animate-pulse">
                                Uploading documents...
                            </div> 
                        ) : (
                        <>
                        {
                        fetchingFiles ? (
                            <div className="text-gray-500 text-sm animate-pulse">
                                Fetching documents...
                            </div> ) : 
                        files.length > 0 ? (
                            <div className="flex flex-col w-full">
                                {files.map((file) => (
                                    <div
                                        key={file.name}
                                        className="flex items-center justify-between bg-gray-700 text-white rounded p-3 mb-2"
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
                
                <div className="border-t border-gray-600 my-2"></div>
                
                <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
                    <div className="flex flex-row justify-between items-center">
                        <h1 className="text-lg font-normal">Specifications</h1>
                        <div className="flex flex-row justify-end">
                            <div className="cursor-pointer" onClick={() => {}}>
                                <RiDeleteBinLine className="w-6 h-6" />
                            </div>
                            <div className="cursor-pointer" onClick={() => addNewSpecification()}>
                                <RiAddFill className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500">Select Specification</div>
                    <select className="border border-gray-400 rounded"
                        ref={selectSpecificationRef}
                        value={selectedSpecificationId || ''} 
                        // defaultValue={selectSpecificationRef.current[0]}
                        onChange={handleSpecificationSelect}>
                        {selectedWorkspace ? (selectedWorkspace.specifications.map((spec) => (
                            <option className="truncate w-4/5 text-left" key={spec.id} value={spec.id}>
                                {spec.name}
                            </option>
                        ))) : (<></>)}
                    </select>
                    <div className="text-sm text-gray-500">Specification Name</div>
                    {name !== null ? (
                        <input
                            type="text"
                            className="border border-gray-400 p-2 rounded"
                            value={name}
                            onChange={(e) => {setName(e.target.value)}}
                            onBlur={(e) => updateSpecificationName(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(e, () => {})}
                            placeholder="Specification Name"
                        />
                    ) : (<></>)}

                    <div className="text-sm text-gray-500">Topic</div>
                        <div
                            className={`${
                                isTopicFocused ? 'border border-yellow-500' : 'border'
                            } border-gray-400 p-2 rounded cursor-pointer`}
                            onClick={() => setIsTopicFocused(true)}
                            onBlur={() => setIsTopicFocused(false)}
                        >
                            {isTopicFocused ? (
                                <textarea
                                    className="w-full h-20 p-2"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    onBlur={(e) => updateSpecificationTopic(e.target.value)}
                                    onKeyDown={(e) => handleTextareaKeyDown(e, () => {})}
                                    placeholder="Provide a topic..."
                                />
                            ) : (
                                <span className={`${topic ? '' : 'text-gray-400'}`}>
                                    {topic || 'Provide a topic...'}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">Writing Level</div>
                        <select
                            className="border border-gray-400 p-2 rounded"
                            value={writingLevel}
                            onChange={(e) => {
                                setWritingLevel(e.target.value)
                                updateSpecificationWritingLevel(e.target.value);
                            }}
                        >
                            <option>Elementary</option>
                            <option>High-school</option>
                            <option>College</option>
                            <option>Professional</option>
                        </select>
                        <div className="text-sm text-gray-500">Comprehension Level</div>
                        <select
                            className="border border-gray-400 p-2 rounded"
                            value={comprehensionLevel}
                            onChange={(e) => {
                                setComprehensionLevel(e.target.value)
                                updateSpecificationComprehensionLevel(e.target.value);
                            }}
                        >
                            <option>Simple</option>
                            <option>Standard</option>
                            <option>Comprehensive</option>
                        </select>
                        <div className="text-sm text-gray-500">Additional Specifications</div>
                        {additionalSpecs.map((spec, index) => (
                            <div
                                key={index}
                                className={`${
                                    focusedAdditionalSpecIndex === index ? 'border border-yellow-500' : 'border'
                                } border-gray-400 p-2 rounded cursor-pointer`}
                                onClick={() => setFocusedAdditionalSpecIndex(index)}
                                onBlur={() => handleAdditionalSpecBlur(index)}
                            >
                                {focusedAdditionalSpecIndex === index ? (
                                    <textarea
                                        className="w-full h-20 p-2"
                                        value={spec.content}
                                        onChange={(e) => handleAdditionalSpecChange(index, e.target.value)}
                                        onBlur={(e) => {e.target.value === '' ? removeAdditionalSpecification(index) : updateAdditionalSpecification(index, e.target.value) }}
                                        onKeyDown={(e) => handleTextareaKeyDown(e, () => { setFocusedAdditionalSpecIndex(null) })}
                                        placeholder="Additional specifications..."
                                    />
                                ) : (
                                    <span className={`${spec ? '' : 'text-gray-400'}`}>
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

                <div className="border-t border-gray-600 my-2"></div>
                
                <div className="flex flex-col mx-3 mb-2 p-2 gap-2">
                    <div className="flex flex-row justify-between items-center"> 
                        <h1 className="text-lg font-normal">Pages</h1>
                        <div className="cursor-pointer" onClick={() => {}}>
                            <RiAddFill className="w-6 h-6" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SidenavMaterial;
