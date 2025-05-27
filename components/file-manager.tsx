"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { LayoutGrid, Search, Upload, LogOut, FolderPlus } from "lucide-react"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface FileItem {
  id: string
  name: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string
  folder_id?: string | null
  created_at: string
}

interface FolderItem {
  id: string
  name: string
  user_id: string
  parent_folder_id?: string | null
  created_at: string
  updated_at: string
}

interface UploadProgress {
  fileName: string
  progress: number
  status: "uploading" | "completed" | "error"
}

function NavItem({
  icon,
  children,
  active,
  onClick,
}: { icon: React.ReactNode; children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700 w-full text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md",
        active && "bg-gray-700 text-white shadow-lg",
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

function FolderItemComponent({
  folder,
  onSelect,
  onDelete,
  isSelected,
}: {
  folder: FolderItem
  onSelect: (folderId: string | null) => void
  onDelete: (folderId: string) => void
  isSelected: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 text-sm rounded-lg group transition-all duration-200 transform hover:scale-[1.02]",
        isSelected ? "bg-gray-700 text-white shadow-lg" : "text-gray-300 hover:bg-gray-700",
      )}
    >
      <button onClick={() => onSelect(folder.id)} className="flex items-center gap-2 flex-1 text-left">
        <svg
          className="w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <span>{folder.name}</span>
      </button>
      <button
        onClick={() => onDelete(folder.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-all duration-200 transform hover:scale-110"
      >
        ×
      </button>
    </div>
  )
}

function FileCard({
  file,
  onDelete,
  onDownload,
}: { file: FileItem; onDelete: (file: FileItem) => void; onDownload: (file: FileItem) => void }) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const supabase = getSupabaseClient()

  useEffect(() => {
    const getImageUrl = async () => {
      if (file.file_type.startsWith("image/")) {
        const { data } = await supabase.storage.from("user-files").createSignedUrl(file.storage_path, 3600)

        if (data?.signedUrl) {
          setImageUrl(data.signedUrl)
        }
      }
    }

    getImageUrl()
  }, [file, supabase])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800 bg-opacity-95 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-blue-500">
      <div className="aspect-[4/3] overflow-hidden bg-gray-700 flex items-center justify-center">
        {file.file_type.startsWith("image/") && imageUrl ? (
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={file.original_name}
            width={300}
            height={225}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="text-gray-400 text-3xl transition-transform duration-300 group-hover:scale-110">📄</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white truncate text-sm">{file.original_name}</h3>
        <p className="text-xs text-gray-400 mb-2">
          {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(file)}
            className="flex-1 text-xs h-7 border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white hover:border-gray-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Descargar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(file)}
            className="flex-1 text-xs h-7 border-red-600 text-red-400 bg-red-900 bg-opacity-20 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

function UploadProgressCard({ progress }: { progress: UploadProgress }) {
  return (
    <div className="bg-gray-800 bg-opacity-95 border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white truncate">{progress.fileName}</span>
        <span className="text-xs text-gray-400">{Math.round(progress.progress)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            progress.status === "error"
              ? "bg-red-500"
              : progress.status === "completed"
                ? "bg-green-500"
                : "bg-blue-500",
          )}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {progress.status === "uploading" && "Subiendo..."}
        {progress.status === "completed" && "Completado"}
        {progress.status === "error" && "Error en la subida"}
      </div>
    </div>
  )
}

export default function FileManager({ user }: { user: User }) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadFiles()
    loadFolders()
  }, [selectedFolder])

  const loadFiles = async () => {
    try {
      console.log("Loading files for user:", user.id)

      let query = supabase.from("files").select("*").eq("user_id", user.id)

      if (selectedFolder) {
        query = query.eq("folder_id", selectedFolder)
      } else {
        query = query.is("folder_id", null)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading files details:", error)
        throw new Error(`Failed to load files: ${error.message || JSON.stringify(error)}`)
      }

      console.log("Files loaded:", data)
      setFiles(data || [])
    } catch (error: any) {
      console.error("Error loading files:", error)
      alert(`Error al cargar archivos: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading folders:", error)
        throw error
      }

      console.log("Folders loaded:", data)
      setFolders(data || [])
    } catch (error: any) {
      console.error("Error loading folders:", error)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const { data, error } = await supabase
        .from("folders")
        .insert({
          user_id: user.id,
          name: newFolderName.trim(),
          parent_folder_id: selectedFolder,
        })
        .select()

      if (error) throw error

      console.log("Folder created:", data)
      setNewFolderName("")
      setShowCreateFolder(false)
      await loadFolders()
    } catch (error: any) {
      console.error("Error creating folder:", error)
      alert(`Error al crear carpeta: ${error.message}`)
    }
  }

  const deleteFolder = async (folderId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta carpeta?")) return

    try {
      // Primero eliminar todos los archivos en la carpeta
      const { error: filesError } = await supabase.from("files").delete().eq("folder_id", folderId)

      if (filesError) {
        console.error("Error deleting files in folder:", filesError)
      }

      // Luego eliminar la carpeta
      const { error } = await supabase.from("folders").delete().eq("id", folderId)

      if (error) throw error

      if (selectedFolder === folderId) {
        setSelectedFolder(null)
      }
      await loadFolders()
      await loadFiles()
    } catch (error: any) {
      console.error("Error deleting folder:", error)
      alert(`Error al eliminar carpeta: ${error.message}`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length === 0) return

    for (const file of droppedFiles) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    // Verificar el tamaño del archivo - Supabase tiene límite de 50MB por defecto
    const maxSize = 50 * 1024 * 1024 // 50MB - límite real de Supabase
    if (file.size > maxSize) {
      alert(
        `El archivo "${file.name}" es demasiado grande. El límite actual es de 50MB. Para archivos más grandes, considera usar un servicio de almacenamiento externo.`,
      )
      return
    }

    const progressId = Date.now().toString()
    const progressItem: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: "uploading",
    }

    setUploadProgress((prev) => [...prev, progressItem])
    setUploading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${selectedFolder ? `${selectedFolder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name && p.status === "uploading"
              ? { ...p, progress: Math.min(p.progress + 10, 90) }
              : p,
          ),
        )
      }, 200)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      clearInterval(progressInterval)

      if (uploadError) {
        setUploadProgress((prev) =>
          prev.map((p) => (p.fileName === file.name ? { ...p, progress: 100, status: "error" } : p)),
        )
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      const { error: dbError } = await supabase.from("files").insert({
        user_id: user.id,
        name: fileName,
        original_name: file.name,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        storage_path: fileName,
        folder_id: selectedFolder,
      })

      if (dbError) {
        await supabase.storage.from("user-files").remove([fileName])
        setUploadProgress((prev) =>
          prev.map((p) => (p.fileName === file.name ? { ...p, progress: 100, status: "error" } : p)),
        )
        throw new Error(`Database error: ${dbError.message}`)
      }

      setUploadProgress((prev) =>
        prev.map((p) => (p.fileName === file.name ? { ...p, progress: 100, status: "completed" } : p)),
      )

      await loadFiles()

      // Remover el progreso después de 3 segundos
      setTimeout(() => {
        setUploadProgress((prev) => prev.filter((p) => p.fileName !== file.name))
      }, 3000)
    } catch (error: any) {
      console.error("Error uploading file:", error)
      alert(`Error al subir el archivo: ${error.message}`)
      setUploadProgress((prev) =>
        prev.map((p) => (p.fileName === file.name ? { ...p, progress: 100, status: "error" } : p)),
      )
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList) return

    const filesArray = Array.from(fileList)
    for (const file of filesArray) {
      await uploadFile(file)
    }

    event.target.value = ""
  }

  const handleDownloadFile = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage.from("user-files").download(file.storage_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = file.original_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error("Error downloading file:", error)
      alert(`Error al descargar el archivo: ${error.message}`)
    }
  }

  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${file.original_name}"?`)) {
      return
    }

    try {
      const { error: storageError } = await supabase.storage.from("user-files").remove([file.storage_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase.from("files").delete().eq("id", file.id)

      if (dbError) throw dbError

      await loadFiles()
    } catch (error: any) {
      console.error("Error deleting file:", error)
      alert(`Error al eliminar el archivo: ${error.message}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className="flex h-screen bg-gray-900 relative overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Fondo cuadriculado animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Cuadrícula principal */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              animation: "gridMove 25s linear infinite",
            }}
          />
          {/* Cuadrícula secundaria más pequeña */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(147, 197, 253, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(147, 197, 253, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
              animation: "gridMove 15s linear infinite reverse",
            }}
          />
          {/* Puntos brillantes en intersecciones */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
          {/* Líneas diagonales sutiles */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(45deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                linear-gradient(-45deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px",
              animation: "gridMove 30s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Overlay de drag and drop */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600 bg-opacity-20 border-4 border-dashed border-blue-400 z-50 flex items-center justify-center transition-all duration-300">
          <div className="text-white text-2xl font-bold animate-bounce">
            Suelta los archivos aquí (máx. 50MB por archivo)
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700 bg-gray-800 bg-opacity-95 backdrop-blur-sm relative z-10">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">Mi Almacén</h1>
        </div>
        <nav className="space-y-1 px-2">
          <NavItem
            icon={<LayoutGrid className="h-4 w-4" />}
            active={selectedFolder === null}
            onClick={() => setSelectedFolder(null)}
          >
            Todos los archivos
          </NavItem>
          <div className="py-3">
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="text-xs font-medium uppercase text-gray-400">Carpetas</div>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="text-gray-400 hover:text-white text-lg transition-all duration-200 transform hover:scale-110 hover:rotate-12"
                title="Crear carpeta"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>
            {showCreateFolder && (
              <div className="px-3 mb-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2">
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nombre de carpeta"
                    className="bg-gray-700 border-gray-600 text-white text-sm h-8 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onKeyPress={(e) => e.key === "Enter" && createFolder()}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={createFolder}
                    className="h-8 px-2 transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    ✓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCreateFolder(false)}
                    className="h-8 px-2 transition-all duration-200 transform hover:scale-110 active:scale-95"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-1">
              {folders.map((folder) => (
                <FolderItemComponent
                  key={folder.id}
                  folder={folder}
                  onSelect={setSelectedFolder}
                  onDelete={deleteFolder}
                  isSelected={selectedFolder === folder.id}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-transparent relative z-10">
        <header className="flex items-center justify-between border-b border-gray-700 px-6 py-4 bg-gray-800 bg-opacity-95 backdrop-blur-sm">
          <div className="w-96">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar archivos..."
                className="pl-9 bg-gray-700 border-gray-600 text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-[1.02]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{user.email}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              onClick={triggerFileUpload}
              className="gap-2 bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              <span className="flex items-center gap-2">
                {uploading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {uploading ? "Subiendo..." : "Subir archivo (máx. 50MB)"}
              </span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </div>

          {/* Progress indicators */}
          {uploadProgress.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Progreso de subida</h3>
              {uploadProgress.map((progress, index) => (
                <UploadProgressCard key={`${progress.fileName}-${index}`} progress={progress} />
              ))}
            </div>
          )}

          <div className="mb-6">
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="bg-gray-800 bg-opacity-95 border-gray-700">
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 transition-all duration-200 transform hover:scale-105"
                >
                  {selectedFolder ? `Carpeta: ${folders.find((f) => f.id === selectedFolder)?.name}` : "Recientes"}
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 transition-all duration-200 transform hover:scale-105"
                >
                  Todos
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-300">
              <div className="inline-flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Cargando archivos...
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-400 animate-in fade-in-50 duration-500">
              {selectedFolder ? "Esta carpeta está vacía." : "No tienes archivos aún."} ¡Sube tu primer archivo!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-in fade-in-50 duration-500">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="animate-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FileCard file={file} onDelete={handleDeleteFile} onDownload={handleDownloadFile} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 right-4">
          <a
            href="https://1-portafolio1.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-blue-400 transition-all duration-200 transform hover:scale-105"
          >
            Página creada por VortexDev
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
      `}</style>
    </div>
  )
}
