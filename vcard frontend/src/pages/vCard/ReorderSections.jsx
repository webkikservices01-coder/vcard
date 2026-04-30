import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const allSections = [
  { id: 'contact',      label: 'Contact Details',     emoji: '📞' },
  { id: 'products',     label: 'Products & Services', emoji: '🛍️' },
  { id: 'portfolio',    label: 'Portfolio',            emoji: '💼' },
  { id: 'gallery',      label: 'Gallery',              emoji: '🖼️' },
  { id: 'testimonials', label: 'Testimonials',         emoji: '⭐' },
  { id: 'custom',       label: 'Custom Sections',      emoji: '📝' },
];

const getSectionById = (id) => allSections.find(s => s.id === id);

const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const ReorderSections = () => {
  const [sections, setSections] = useState(allSections);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs for drag — avoids stale closure issues during re-render
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Load saved order from backend
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('https://vcard-backend-uuq6.onrender.com/api/settings', { headers: headers() });
        const order = res.data?.sectionOrder;
        if (Array.isArray(order) && order.length > 0) {
          // Build ordered list, include any missing at the end
          const ordered = order.map(id => getSectionById(id)).filter(Boolean);
          const missing = allSections.filter(s => !order.includes(s.id));
          setSections([...ordered, ...missing]);
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Drag handlers — reorder only on dragEnd using refs
  const handleDragStart = (e, idx) => {
    dragItem.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    // Slight delay so the ghost image renders before we change opacity
    setTimeout(() => {
      const el = e.currentTarget;
      if (el) el.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnter = (e, idx) => {
    e.preventDefault();
    dragOverItem.current = idx;
    // Visual highlight on the target row
    const rows = document.querySelectorAll('[data-drag-row]');
    rows.forEach((r, i) => {
      r.style.background = i === idx ? '#f3f4f6' : '';
      r.style.borderTop = i === idx && idx !== dragItem.current ? '2px solid #000' : '';
    });
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    // Clear highlights
    document.querySelectorAll('[data-drag-row]').forEach(r => {
      r.style.background = ''; r.style.borderTop = '';
    });

    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) { dragItem.current = null; dragOverItem.current = null; return; }

    const updated = [...sections];
    const [moved] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, moved);
    setSections(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e) => e.preventDefault();

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...sections];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setSections(updated);
  };

  const moveDown = (idx) => {
    if (idx === sections.length - 1) return;
    const updated = [...sections];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setSections(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('https://vcard-backend-uuq6.onrender.com/api/settings', {
        sectionOrder: sections.map(s => s.id)
      }, { headers: headers() });
      toast.success('Section order saved!');
    } catch { toast.error('Failed to save order'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reorder Sections</h2>
        <p className="text-sm text-gray-500">Drag or use arrows to arrange sections on your vCard</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">Drag rows or use ▲ ▼ buttons to reorder</p>
          <span className="text-xs text-gray-400">{sections.length} sections</span>
        </div>

        <div className="divide-y divide-gray-100">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              data-drag-row
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              className="flex items-center space-x-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing select-none"
            >
              {/* Grip handle */}
              <GripVertical className="w-5 h-5 text-gray-400 shrink-0" />

              {/* Position number */}
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-gray-500">{idx + 1}</span>
              </div>

              {/* Label */}
              <div className="flex items-center space-x-2.5 flex-1">
                <span className="text-lg leading-none">{section.emoji}</span>
                <span className="text-sm font-medium text-gray-900">{section.label}</span>
              </div>

              {/* Arrow buttons */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === sections.length - 1}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current order preview */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Current order on your card:</p>
        <div className="flex flex-wrap gap-2">
          {sections.map((s, i) => (
            <span key={s.id} className="inline-flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">
              <span className="text-gray-400 font-bold">{i + 1}.</span>
              <span>{s.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-black text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Order'}</span>
        </button>
      </div>
    </div>
  );
};

export default ReorderSections;
