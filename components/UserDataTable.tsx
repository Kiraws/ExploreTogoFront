"use client"
import * as React from "react"
import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type TableMeta,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { buildApiUrl } from "@/lib/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconDotsVertical, IconEdit, IconTrash, IconChevronsLeft, IconChevronLeft, IconChevronRight, IconChevronsRight } from "@tabler/icons-react"

// Interface pour les utilisateurs basée sur ton API /api/users
export interface User {
  id: string
  name: string
  firstname: string
  email: string
  role: string
  status?: boolean
}

// Interface pour le meta de la table
interface UserTableMeta extends TableMeta<User> {
  updateData: (rowIndex: number, newData: Partial<User>) => void
}

// Interface pour le formulaire d'édition d'utilisateur
interface UserFormData {
  name: string
  firstname: string
  email: string
  role: string
}

// Données initiales pour le formulaire d'édition
const initialUserFormState: UserFormData = {
  name: "",
  firstname: "",
  email: "",
  role: "utilisateur",
}

const userRoles = ["admin", "utilisateur"] as const

// Composant de formulaire pour éditer un utilisateur
function EditUserForm({ user, onUpdate, onOpenChange }: { 
  user: User, 
  onUpdate: (updatedUser: User) => void, 
  onOpenChange: (open: boolean) => void 
}) {
  const [form, setForm] = useState<UserFormData>(initialUserFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialiser le formulaire avec les données de l'utilisateur
  React.useEffect(() => {
    setForm({
      name: user.name || "",
      firstname: user.firstname || "",
      email: user.email || "",
      role: user.role || "utilisateur",
    })
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setForm({ ...form, [id]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(buildApiUrl(`/api/users/${user.id}`), {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Erreur ${response.status}: ${errorData.message || response.statusText}`)
      }
      const result = await response.json()
      onUpdate(result.data)
      onOpenChange(false)
      setForm(initialUserFormState)
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstname">Prénom</Label>
          <Input id="firstname" value={form.firstname} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Rôle</Label>
          <Select onValueChange={(value) => setForm({ ...form, role: value })} value={form.role}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mise à jour en cours..." : "Enregistrer les modifications"}
        </Button>
      </DialogFooter>
    </form>
  )
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActionsCell({ row, table }: { row: Row<User>; table: any }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDesactivate = async () => {
    if (!confirm(`Voulez-vous vraiment désactiver l'utilisateur ${row.original.name} ${row.original.firstname} ?`)) return
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(buildApiUrl(`/api/users/${row.original.id}/desactivate`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Erreur ${response.status}: ${errorData.message || response.statusText}`)
      }

      const meta = table.options.meta as UserTableMeta
      meta.updateData(row.index, { ...row.original, status: false })
      alert("Utilisateur désactivé avec succès.")
    } catch (error) {
      console.error("Erreur lors de la désactivation:", error)
      alert("Échec de la désactivation.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateUser = (updatedUser: User) => {
    const meta = table.options.meta as UserTableMeta
    meta.updateData(row.index, updatedUser)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            <IconEdit className="mr-2 size-4" />
            Modifier
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onSelect={handleDesactivate}
            disabled={isDeleting}
          >
            <IconTrash className="mr-2 size-4" />
            {isDeleting ? "Désactivation..." : "Désactiver"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de {row.original.name} {row.original.firstname}.
            </DialogDescription>
          </DialogHeader>

          <EditUserForm
            user={row.original}
            onUpdate={handleUpdateUser}
            onOpenChange={setShowEditDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}


// Colonnes pour la table des utilisateurs
const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "firstname",
    header: "Prénom",
    cell: ({ row }) => <div>{row.original.firstname}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="truncate" title={row.original.email}>{row.original.email}</div>,
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
        {row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Actif",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status !== false ? "Actif" : "Inactif"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => <ActionsCell row={row} table={table} />,
  },
]

export function UserDataTable({ data: initialData }: { data: User[] }) {
  const [data, setData] = useState<User[]>(initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateData: (rowIndex: number, newData: Partial<User>) => {
        setData((old) =>
          old.map((row, index) => (index === rowIndex ? { ...row, ...newData } : row))
        )
      },
    } as UserTableMeta,
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} sur {table.getFilteredRowModel().rows.length} ligne(s)
          sélectionnée(s).
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Lignes par page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
