'use client'
import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Edit2 } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Task {
  id: string
  content: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: "TO DO", tasks: [] },
    { id: 'inProgress', title: "IN PROGRESS", tasks: [] },
    { id: 'toReview', title: "TO REVIEW", tasks: [] },
    { id: 'done', title: "DONE", tasks: [] },
  ]),
    [editingTask, setEditingTask] = useState<string | null>(null),
    [editContent, setEditContent] = useState<string>(''),
    [content, setContent] = useState<string>('')

  const onDragEnd = (result: any) => {
    const { source, destination } = result
    if (!destination) return

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId),
      destinationColIndex = columns.findIndex(col => col.id === destination.droppableId),
      sourceCol = columns[sourceColIndex],
      destinationCol = columns[destinationColIndex]

    const newColumns = [...columns],
      [movedTask] = sourceCol.tasks.splice(source.index, 1)
    destinationCol.tasks.splice(destination.index, 0, movedTask)

    setColumns(newColumns)

    return
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: Task = {
      id: `task-${Date.now}`,
      content
    }
    const newColumns = [...columns]
    newColumns[0].tasks.push(newTask)
    setColumns(newColumns)

    return
  }

  const startEditing = (taskId: string, content: string) => {
    setEditingTask(taskId)
    setEditContent(content)

    return
  }

  const saveEdit = () => {
    const newColumns = columns.map(column => ({
      ...column,
      tasks: column.tasks.map(task => task.id === editingTask ? { ...task, content: editContent } : task)
    }))
    setColumns(newColumns)
    setEditingTask(null)

    return
  }

  return (
    <main className="md:container m-auto p-6">
      <header>
        <h1 className="font-bold mb-2">Task Board App</h1>
        <Dialog>
          <DialogTrigger className="bg-stone-900 text-white p-2 rounded-md">
            + Adicionar Tarefa
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
              <label className='text-sm'>Descreva a tarefa...</label>
              <textarea name="content" className='border p-2 rounded-md' onChange={(e) => setContent(e.target.value)}></textarea>
              <DialogFooter>
                <DialogClose asChild>
                  <button type='submit' className="bg-stone-900 text-white p-2 rounded-md">Salvar Tarefa</button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      <DragDropContext onDragEnd={onDragEnd}>
        <section className="grid grid-cols-4 gap-4 mt-4">
          {columns.map(column => (
            <div key={column.id} className="bg-gray-100 p-2 rounded-md h-[100dvh]">
              <h2 className="font-bold text-gray-700 mb-2">{column.title}</h2>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="h-[100%]">
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={column.id === 'done' ? 'bg-green-300' : 'bg-white'}>
                            <CardContent className='p-4 flex justify-between text-sm'>
                              {editingTask === task.id ? (
                                <input value={editContent} onChange={(e) => setEditContent(e.target.value)} className='mr-2 border rounded-md p-2' />
                              ) : (<span>{task.content}</span>)}
                              {editingTask === task.id ? (
                                <button onClick={saveEdit}>
                                  <Check className='h-4 w-4' />
                                </button>
                              ) : (
                                <button onClick={() => startEditing(task.id, task.content)}>
                                  <Edit2 className='h-4 w-4' />
                                </button>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </section>
      </DragDropContext>
    </main>
  );
}
