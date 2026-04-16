import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { INK, RADIUS, SHADOW, SURFACE, SURFACE_ELEVATED } from '../../styles/tokens'
import { formatDateShort } from '../../utils/dateUtils'
import type { ExerciseNote } from '../../types'

interface ExerciseNotesModalProps {
  open: boolean
  exerciseId: string
  exerciseName: string
  onClose: () => void
}

export default function ExerciseNotesModal({
  open,
  exerciseId,
  exerciseName,
  onClose,
}: ExerciseNotesModalProps) {
  const { getExerciseNotes, addExerciseNote, updateExerciseNote, deleteExerciseNote } =
    useWorkoutStore()

  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const notes = getExerciseNotes(exerciseId)

  function handleAdd() {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const note: ExerciseNote = {
      id: `ex-note-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
      exerciseId,
      date: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      text,
    }
    addExerciseNote(note)
    setDraft('')
  }

  function startEdit(note: ExerciseNote) {
    setEditingId(note.id)
    setEditingText(note.text)
  }

  function saveEdit() {
    if (!editingId) return
    const text = editingText.trim()
    if (text) {
      updateExerciseNote(editingId, text)
    }
    setEditingId(null)
    setEditingText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingText('')
  }

  function confirmDelete(id: string) {
    deleteExerciseNote(id)
    setConfirmDeleteId(null)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 pt-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-md flex flex-col border-[3px] border-[#3A1248] overflow-hidden"
            style={{
              backgroundColor: SURFACE_ELEVATED,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.lg,
              maxHeight: '85dvh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 flex items-center justify-center border-[2px] border-[#3A1248]"
                  style={{
                    backgroundColor: '#E8B820',
                    borderRadius: RADIUS.blob,
                    boxShadow: SHADOW.xs,
                  }}
                >
                  <NoteGlyph size={18} color={INK} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
                    Note
                  </p>
                  <p className="text-sm font-bold text-text leading-tight line-clamp-1">
                    {exerciseName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="w-9 h-9 flex items-center justify-center border-[2px] border-[#3A1248] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                style={{
                  backgroundColor: SURFACE,
                  borderRadius: RADIUS.btnSm,
                  boxShadow: SHADOW.xs,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round">
                  <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-2">
              {notes.length === 0 ? (
                <div
                  className="text-center py-8 border-[2px] border-dashed border-[#3A1248]/40"
                  style={{ borderRadius: RADIUS.card }}
                >
                  <p className="text-sm text-text-muted">
                    Nessuna nota per questo esercizio.
                  </p>
                  <p className="text-xs text-text-muted/70 mt-1">
                    Aggiungi la prima qui sotto ✨
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {notes.map((note) => {
                    const isEditing = editingId === note.id
                    const isConfirmingDelete = confirmDeleteId === note.id
                    return (
                      <li
                        key={note.id}
                        className="border-[2.5px] border-[#3A1248] p-3"
                        style={{
                          backgroundColor: SURFACE,
                          borderRadius: RADIUS.card,
                          boxShadow: SHADOW.sm,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border-[1.5px] border-[#3A1248]"
                            style={{
                              backgroundColor: '#F4E8C4',
                              color: INK,
                              borderRadius: RADIUS.pill,
                            }}
                          >
                            {formatDateShort(new Date(note.createdAt))}
                          </span>
                          {!isEditing && !isConfirmingDelete && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => startEdit(note)}
                                aria-label="Modifica"
                                className="w-7 h-7 flex items-center justify-center border-[1.5px] border-[#3A1248] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                style={{
                                  backgroundColor: SURFACE_ELEVATED,
                                  borderRadius: RADIUS.btnSm,
                                  boxShadow: SHADOW.xxs,
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9.5 2.5l2 2-7 7H2.5v-2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(note.id)}
                                aria-label="Elimina"
                                className="w-7 h-7 flex items-center justify-center border-[1.5px] border-[#3A1248] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                style={{
                                  backgroundColor: '#FDECEA',
                                  borderRadius: RADIUS.btnSm,
                                  boxShadow: SHADOW.xxs,
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#CC3020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 4h8M5.5 4V2.5h3V4M4 4l.5 7.5h5L10 4" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={3}
                              className="w-full p-2 text-sm text-text border-[2px] border-[#3A1248] resize-none focus:outline-none"
                              style={{
                                backgroundColor: SURFACE_ELEVATED,
                                borderRadius: RADIUS.btnSm,
                              }}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEdit}
                                className="px-3 h-8 text-xs font-semibold border-[2px] border-[#3A1248] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                style={{
                                  backgroundColor: SURFACE,
                                  color: INK,
                                  borderRadius: RADIUS.btnSm,
                                  boxShadow: SHADOW.xs,
                                }}
                              >
                                Annulla
                              </button>
                              <button
                                onClick={saveEdit}
                                className="px-3 h-8 text-xs font-semibold border-[2px] border-[#3A1248] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                style={{
                                  backgroundColor: '#17A8A8',
                                  color: '#FFFBF0',
                                  borderRadius: RADIUS.btnSm,
                                  boxShadow: SHADOW.xs,
                                }}
                              >
                                Salva
                              </button>
                            </div>
                          </div>
                        ) : isConfirmingDelete ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-text-muted">
                              Eliminare questa nota?
                            </p>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 h-8 text-xs font-semibold border-[2px] border-[#3A1248] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                style={{
                                  backgroundColor: SURFACE_ELEVATED,
                                  color: INK,
                                  borderRadius: RADIUS.btnSm,
                                  boxShadow: SHADOW.xs,
                                }}
                              >
                                Annulla
                              </button>
                              <button
                                onClick={() => confirmDelete(note.id)}
                                className="px-3 h-8 text-xs font-semibold border-[2px] border-[#3A1248] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                                style={{
                                  backgroundColor: '#FDECEA',
                                  color: '#CC3020',
                                  borderRadius: RADIUS.btnSm,
                                  boxShadow: SHADOW.xs,
                                }}
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-text whitespace-pre-wrap break-words leading-snug">
                            {note.text}
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div
              className="px-5 pt-3 pb-4 border-t-[2.5px] border-[#3A1248]"
              style={{ backgroundColor: SURFACE }}
            >
              <label className="block text-[11px] uppercase tracking-wider text-text-muted font-medium mb-1.5">
                Nuova nota
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Es. Fatto con manubrio 14kg, ultima serie a fatica..."
                rows={3}
                className="w-full p-2.5 text-sm text-text border-[2.5px] border-[#3A1248] resize-none focus:outline-none placeholder:text-text-muted/60"
                style={{
                  backgroundColor: SURFACE_ELEVATED,
                  borderRadius: RADIUS.btnSm,
                  boxShadow: SHADOW.xs,
                }}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAdd}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1.5 px-4 h-10 text-sm font-bold border-[3px] border-[#3A1248] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 disabled:pointer-events-none"
                  style={{
                    backgroundColor: '#E8B820',
                    color: INK,
                    borderRadius: RADIUS.btnMd,
                    boxShadow: SHADOW.md,
                  }}
                >
                  <PlusGlyph size={14} color={INK} />
                  Aggiungi
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function NoteGlyph({ size = 18, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h8l4 4v10H4z" />
      <path d="M12 3v4h4" />
      <path d="M7 11h6M7 14h4" />
    </svg>
  )
}

function PlusGlyph({ size = 14, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  )
}
