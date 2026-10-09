/**
 * @yunary/ds — le design system Yunary : socle générique + marque Yunary.
 *
 * Les styles sont un import séparé, en JS — DEUX imports, jamais un :
 *   import '@yunary/ds/core.css';
 *   import '@yunary/ds/brand-yunary.css';
 *
 * La couche Tailwind v4 s'importe depuis le CSS de l'app, jamais en JS :
 *   @import '@yunary/ds/theme.css';
 */

/* icons */
/* L'identité textuelle — les défauts que lisent Logo, Navbar et Avatar. Exportée pour
   qu'une app puisse les relire ; `npm run rebrand` les réécrit. */
export { BRAND_NAME, BRAND_MONOGRAM, BRAND_WORDMARK_LINES } from './brand';

export { Icon } from './components/icons/Icon';
export type { IconProps, IconBaseProps, IconName } from './components/icons/Icon';

/* actions */
export { Button } from './components/actions/Button';
export type { ButtonProps } from './components/actions/Button';
export { IconButton } from './components/actions/IconButton';
export type { IconButtonProps } from './components/actions/IconButton';

/* forms */
export { Input } from './components/forms/Input';
export type { InputProps } from './components/forms/Input';
export { Textarea } from './components/forms/Textarea';
export type { TextareaProps } from './components/forms/Textarea';
export { Select } from './components/forms/Select';
export type { SelectProps, SelectOption } from './components/forms/Select';
export { Calendar } from './components/forms/Calendar';
export type { CalendarProps } from './components/forms/Calendar';
export { DatePicker } from './components/forms/DatePicker';
export type { DatePickerProps, DatePickerTriggerApi } from './components/forms/DatePicker';
export { Checkbox } from './components/forms/Checkbox';
export type { CheckboxProps } from './components/forms/Checkbox';
export { Radio } from './components/forms/Radio';
export type { RadioProps } from './components/forms/Radio';
export { Switch } from './components/forms/Switch';
export type { SwitchProps } from './components/forms/Switch';
export { FormField } from './components/forms/FormField';
export type { FormFieldProps } from './components/forms/FormField';
export { Dropzone } from './components/forms/Dropzone';
export type { DropzoneProps } from './components/forms/Dropzone';

/* data-display */
export { Card } from './components/data-display/Card';
export type { CardProps } from './components/data-display/Card';
export { Badge } from './components/data-display/Badge';
export type { BadgeProps } from './components/data-display/Badge';
export { Pastille } from './components/data-display/Pastille';
export type { PastilleProps } from './components/data-display/Pastille';
export { Tooltip } from './components/data-display/Tooltip';
export type { TooltipProps } from './components/data-display/Tooltip';
export { Separator } from './components/data-display/Separator';
export type { SeparatorProps } from './components/data-display/Separator';
export { Table, THead, TBody, Tr, Th, Td } from './components/data-display/Table';
export type { TableProps } from './components/data-display/Table';

/* feedback */
export { Toast } from './components/feedback/Toast';
export type { ToastProps } from './components/feedback/Toast';
export { Banner } from './components/feedback/Banner';
export type { BannerProps } from './components/feedback/Banner';
export { EmptyState } from './components/feedback/EmptyState';
export type { EmptyStateProps } from './components/feedback/EmptyState';
export { StateCard } from './components/feedback/StateCard';
export type { StateCardProps } from './components/feedback/StateCard';
export { Skeleton } from './components/feedback/Skeleton';
export type { SkeletonProps } from './components/feedback/Skeleton';
export { SkeletonCard } from './components/feedback/SkeletonCard';
export type { SkeletonCardProps } from './components/feedback/SkeletonCard';
export { Spinner } from './components/feedback/Spinner';
export type { SpinnerProps } from './components/feedback/Spinner';
export { Progress } from './components/feedback/Progress';
export type { ProgressProps } from './components/feedback/Progress';

/* overlays */
export { Modal } from './components/overlays/Modal';
export type { ModalProps, ModalResult } from './components/overlays/Modal';

/* navigation */
export { Navbar } from './components/navigation/Navbar';
export type { NavbarProps, NavLink } from './components/navigation/Navbar';
export { Footer } from './components/navigation/Footer';
export type { FooterProps, FooterColumn } from './components/navigation/Footer';
export { Tabs } from './components/navigation/Tabs';
export type { TabsProps, TabItem } from './components/navigation/Tabs';
export { Pagination } from './components/navigation/Pagination';
export type { PaginationProps } from './components/navigation/Pagination';
export { AppShell } from './components/navigation/AppShell';
export type { AppShellProps } from './components/navigation/AppShell';
export { Sidebar } from './components/navigation/Sidebar';
export type { SidebarProps, SidebarItem, SidebarSection } from './components/navigation/Sidebar';

/* brand */
export { Logo } from './components/brand/Logo';
export type { LogoProps } from './components/brand/Logo';
export { Halo } from './components/brand/Halo';
export type { HaloProps } from './components/brand/Halo';
export { Avatar } from './components/brand/Avatar';
export type { AvatarProps } from './components/brand/Avatar';

/* utilitaire de composition de classes */
export { cn, makeCn, PALIERS_TYPO } from './lib/cn';
export type { ClassValue } from './lib/cn';
