import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, ChevronDown } from 'lucide-react';

export default function CustomSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option...', 
  isSearchable = true, 
  onCreate, 
  createLabel = 'Add New',
  showDots = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [creating, setCreating] = useState(false);
  const [localSelectedName, setLocalSelectedName] = useState('');
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync local display name when value changes
  useEffect(() => {
    if (!value) {
      setLocalSelectedName('');
    }
  }, [value]);

  const selectedOption = options.find(o => o && (o.id === value || o.value === value));
  const displayName = selectedOption?.name || selectedOption?.label || localSelectedName || '';
  
  const filtered = options.filter(o => {
    const name = o?.name || o?.label || '';
    return name.toString().toLowerCase().includes(searchText.toLowerCase());
  });

  const isExactMatch = options.some(o => {
    const name = o?.name || o?.label || '';
    return name.toString().toLowerCase() === searchText.toLowerCase();
  });
  
  const canCreate = onCreate && searchText.trim().length > 0 && !isExactMatch;

  const dotColors = ['#e11d48', '#3b82f6', '#111827', '#a855f7', '#f97316', '#e5e7eb', '#facc15', '#ec4899', '#14b8a6', '#8b5cf6'];

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    try {
      const newOption = await onCreate(searchText.trim());
      if (newOption) {
        setLocalSelectedName(newOption.name || newOption.label || searchText.trim());
        onChange(newOption.id || newOption.value);
        setSearchText('');
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to create option:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={ref} className={`custom-select-container ${className}`} style={{ position: 'relative' }}>
      {/* Control / Trigger */}
      <div
        className="form-input"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: displayName ? 'var(--text-primary)' : 'var(--text-muted)',
          minHeight: '43px',
          paddingRight: '10px'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
          {displayName || placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {displayName && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 10000,
          width: '100%',
          left: 0,
          top: '100%',
          marginTop: '4px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'dropdownFadeIn 0.2s ease-out'
        }}>
          {isSearchable && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px', color: 'var(--text-primary)' }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canCreate) {
                      e.preventDefault();
                      handleCreate();
                    }
                    if (e.key === 'Escape') setIsOpen(false);
                  }}
                />
                <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            </div>
          )}

          {onCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate || creating}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                backgroundColor: canCreate ? 'var(--accent-dim)' : 'transparent',
                cursor: canCreate ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                outline: 'none',
                opacity: canCreate ? 1 : 0.5,
              }}
            >
              <Plus size={16} style={{ color: canCreate ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: canCreate ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                {creating ? 'Creating...' : canCreate ? `${createLabel} "${searchText}"` : 'Options'}
              </span>
            </button>
          )}

          {/* Options list */}
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {filtered.length === 0 && !canCreate ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No matches found
              </div>
            ) : (
              filtered.map((opt, i) => {
                const optId = opt?.id !== undefined ? opt.id : opt?.value !== undefined ? opt.value : opt;
                const isSelected = optId === value;
                
                return (
                  <div
                    key={opt?.id || opt?.value || `opt-${i}`}
                    onClick={() => { onChange(optId); setSearchText(''); setIsOpen(false); }}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      transition: 'background-color 0.15s',
                      fontSize: '14px',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {showDots && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColors[i % dotColors.length], flexShrink: 0 }} />
                    )}
                    <span>{opt?.name || opt?.label || opt}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
