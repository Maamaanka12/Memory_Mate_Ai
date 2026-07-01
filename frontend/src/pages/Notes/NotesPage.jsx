import { useEffect, useState, useRef } from 'react';
import { getNotes, uploadNote, deleteNote } from '../../services/dataService';
import Button from '../../components/common/Button';
import { Card, PageHeader, EmptyState, AlertBanner, Badge, Spinner } from '../../components/common/Misc';
import styles from './Notes.module.css';

const TYPE_COLORS = { pdf: 'danger', doc: 'primary', docx: 'primary', ppt: 'warning', pptx: 'warning' };

export default function NotesPage() {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [topic, setTopic]     = useState('');
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    getNotes()
      .then(res => setNotes(res.data.data))
      .catch(() => setError('Failed to load notes.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) { setError('Please select a file.'); return; }

    const fd = new FormData();
    fd.append('file', file);
    if (topic) fd.append('topic', topic);

    setUploading(true); setError(''); setSuccess('');
    try {
      await uploadNote(fd);
      setSuccess('Note uploaded successfully.');
      setTopic('');
      fileRef.current.value = '';
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch {
      setError('Delete failed.');
    }
  };

  return (
    <div>
      <PageHeader title="My Notes" subtitle="Upload study materials for quizzing." />

      {/* Upload card */}
      <Card className={styles.uploadCard}>
        <h3 className={styles.uploadTitle}>Upload New Note</h3>
        <AlertBanner message={error}   type="error"   onClose={() => setError('')} />
        <AlertBanner message={success} type="success" onClose={() => setSuccess('')} />

        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <div className={styles.fileZone} onClick={() => fileRef.current.click()}>
            <span className={styles.fileIcon}>📁</span>
            <p>Click to select file</p>
            <p className={styles.fileTypes}>PDF, DOC, DOCX, PPT, PPTX · Max 20MB</p>
            <input ref={fileRef} type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              className={styles.fileInput} />
          </div>
          <input
            className={styles.topicInput}
            placeholder="Topic (optional) e.g. Biology"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
          <Button type="submit" loading={uploading}>Upload Note</Button>
        </form>
      </Card>

      {/* Notes list */}
      <div className={styles.listHeader}>
        <h3>Uploaded Notes ({notes.length})</h3>
      </div>

      {loading ? (
        <div className={styles.center}><Spinner /></div>
      ) : notes.length === 0 ? (
        <EmptyState icon="📄" title="No notes yet" message="Upload a file above to get started." />
      ) : (
        <div className={styles.noteGrid}>
          {notes.map(note => (
            <Card key={note.id} className={styles.noteCard}>
              <div className={styles.noteTop}>
                <Badge variant={TYPE_COLORS[note.file_type] || 'default'}>
                  {note.file_type.toUpperCase()}
                </Badge>
                {note.topic && <Badge variant="primary">{note.topic}</Badge>}
              </div>
              <p className={styles.noteName}>{note.file_name}</p>
              <p className={styles.noteMeta}>
                {note.file_size ? `${(note.file_size / 1024).toFixed(1)} KB · ` : ''}
                {new Date(note.created_at).toLocaleDateString()}
              </p>
              <div className={styles.noteActions}>
                <Button variant="danger" size="sm" onClick={() => handleDelete(note.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
