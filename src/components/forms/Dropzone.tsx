import { useId, useRef, useState } from 'react';
import type { DragEvent, HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../actions/Button';

/**
 * La zone de dépôt d'un fichier — cadre pointillé, colonne centrée : une tuile, un titre, une aide, des
 * contraintes (`children`), une action qui ouvre le sélecteur. Un fichier glissé au-dessus éclaire la zone
 * (`.is-dragover`) et son titre peut changer (`dragTitle`, « Lâche pour envoyer »).
 *
 * Le composant ne VALIDE rien : il rend les fichiers à `onFiles`, l'app contrôle format, durée et poids,
 * puis pose `invalid` et dit pourquoi (un `Banner` sous la zone). L'<input type="file"> natif reste dans
 * le flux d'accessibilité — le bouton l'ouvre, le clavier et le lecteur d'écran le trouvent.
 * Écrans de Claude (Preact) : les mêmes classes, `.ds-dropzone*`, voir « Classes sans composant ».
 */
export interface DropzoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onDrop'> {
  /** Le titre — « Dépose ta vidéo ici ». */
  title: ReactNode;
  /** Le titre pendant qu'un fichier est tenu au-dessus — « Lâche pour envoyer ». Omis : `title` reste. */
  dragTitle?: ReactNode;
  /** Une ligne d'aide sous le titre. */
  hint?: ReactNode;
  /** La tuile de tête — une `<Pastille>` avec son glyphe. */
  tile?: ReactNode;
  /** Le libellé du bouton qui ouvre le sélecteur. */
  actionLabel: ReactNode;
  /** L'attribut `accept` de l'input — « video/mp4,video/quicktime ». */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Le fichier proposé est refusé : le filet passe au rouge. Le POURQUOI se dit à côté. */
  invalid?: boolean;
  /** Les fichiers choisis ou déposés, tels quels. */
  onFiles: (files: File[]) => void;
  /** Les contraintes, entre l'aide et l'action — des `Badge`. */
  children?: ReactNode;
}

export function Dropzone({
  title, dragTitle, hint, tile, actionLabel, accept, multiple = false, disabled = false, invalid = false,
  onFiles, children, className = '', ...rest
}: DropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [over, setOver] = useState(false);
  const hintId = useId();

  const rendre = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(multiple ? list : [list[0]]));
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    if (!over) setOver(true);
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    /* Quitter un enfant pour un autre n'est pas quitter la zone. */
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setOver(false);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setOver(false);
    rendre(e.dataTransfer.files);
  };

  return (
    <div
      className={cn('ds-dropzone', over && 'is-dragover', invalid && 'is-invalid', disabled && 'is-disabled', className)}
      aria-invalid={invalid || undefined}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...rest}
    >
      {tile}
      <div className="ds-dropzone__main">
        <p className="ds-dropzone__title">{over && dragTitle ? dragTitle : title}</p>
        {hint ? <p className="ds-dropzone__hint" id={hintId}>{hint}</p> : null}
      </div>
      {children}
      <input
        ref={inputRef}
        type="file"
        className="ds-dropzone__input"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-describedby={hint ? hintId : undefined}
        onChange={e => { rendre(e.currentTarget.files); e.currentTarget.value = ''; }}
      />
      <Button variant="primary" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()} aria-describedby={hint ? hintId : undefined}>
        {actionLabel}
      </Button>
    </div>
  );
}
