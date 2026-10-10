import { useId, useRef, useState } from 'react';
import type { DragEvent, HTMLAttributes, JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../actions/Button';

/**
 * La zone de dépôt d'un fichier — cadre pointillé, colonne centrée : une tuile, un titre, une aide, des
 * contraintes (`children`), une action qui ouvre le sélecteur. Un fichier glissé au-dessus éclaire la zone
 * (`.is-dragover`) et son titre peut changer (`dragTitle`, « Lâche pour envoyer »).
 *
 * Deux dessins, voulus (v0.6.0) : la zone par défaut (un bouton « Choisir ma vidéo », des badges de
 * contraintes — la modale) et la zone COMPACTE (`variant="compact"` : le titre en body-sm suivi d'un
 * LIEN `linkLabel`, « ou choisis un fichier », les contraintes en caption dans `hint` — la colonne d'une
 * fiche). Un fichier refusé ne reste pas dans la zone : l'app la REMPLACE par un `Banner` danger et ses
 * actions (la maquette) ; `invalid` reste disponible pour une zone qui doit rester visible.
 *
 * Le composant ne VALIDE rien : il rend les fichiers à `onFiles`, l'app contrôle format, durée et poids.
 * L'<input type="file"> natif reste dans le flux d'accessibilité.
 * Écrans de Claude (Preact) : les mêmes classes, `.ds-dropzone*`, voir « Classes sans composant ».
 */
export interface DropzoneProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onDrop'> {
  /** Le titre — « Dépose ta vidéo ici ». */
  title: ReactNode;
  /** Le titre pendant qu'un fichier est tenu au-dessus — « Lâche pour envoyer ». Omis : `title` reste. */
  dragTitle?: ReactNode;
  /** Une ligne d'aide sous le titre (en compact : les contraintes, « MP4 ou MOV · 9:16 · 3 min · 500 Mo max »). */
  hint?: ReactNode;
  /** La tuile de tête — une `<Pastille>` avec son glyphe (compacte : `size="dialogue" shape="round" tone="neutral"`). */
  tile?: ReactNode;
  /** Le libellé du bouton qui ouvre le sélecteur (défaut). */
  actionLabel?: ReactNode;
  /** `compact` (v0.6.0) : le lien à la place du bouton, le titre en body-sm. */
  variant?: 'default' | 'compact';
  /** Compact : le libellé du lien qui ouvre le sélecteur — « ou choisis un fichier ». */
  linkLabel?: ReactNode;
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
  title, dragTitle, hint, tile, actionLabel = 'Choisir un fichier', variant = 'default', linkLabel = 'ou choisis un fichier',
  accept, multiple = false, disabled = false, invalid = false, onFiles, children, className = '', ...rest
}: DropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [over, setOver] = useState(false);
  const hintId = useId();
  const compact = variant === 'compact';

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
  const ouvrir = () => inputRef.current?.click();

  return (
    <div
      className={cn('ds-dropzone', compact && 'ds-dropzone--compact', over && 'is-dragover', invalid && 'is-invalid', disabled && 'is-disabled', className)}
      aria-invalid={invalid || undefined}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...rest}
    >
      {tile}
      <div className="ds-dropzone__main">
        <p className="ds-dropzone__title">
          {over && dragTitle ? dragTitle : title}
          {compact ? <> <button type="button" className="ds-dropzone__link" disabled={disabled} onClick={ouvrir} aria-describedby={hint ? hintId : undefined}>{linkLabel}</button></> : null}
        </p>
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
      {compact ? null : (
        <Button variant="primary" size="sm" disabled={disabled} onClick={ouvrir} aria-describedby={hint ? hintId : undefined}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
