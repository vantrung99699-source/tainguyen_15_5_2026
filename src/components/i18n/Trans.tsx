import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { useLocaleCurrency } from '../../context/LocaleCurrencyContext';
import { useInlineTranslationOptional } from '../../context/InlineTranslationContext';

export interface TransDynamicTarget {
  entityType: string;
  entityId: string;
  field: string;
}

type TransProps<T extends ElementType> = {
  tKey?: string;
  fallback: string;
  hint?: string;
  dynamic?: TransDynamicTarget;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

export function encodeDynamicAttr(dynamic: TransDynamicTarget): string {
  return `${dynamic.entityType}|${dynamic.entityId}|${dynamic.field}`;
}

export function decodeDynamicAttr(raw: string): TransDynamicTarget | null {
  const parts = raw.split('|');
  if (parts.length < 3) return null;
  return {
    entityType: parts[0],
    entityId: parts[1],
    field: parts.slice(2).join('|'),
  };
}

export function Trans<T extends ElementType = 'span'>({
  tKey,
  fallback,
  hint,
  dynamic,
  as,
  className,
  ...rest
}: TransProps<T>) {
  const Tag = (as ?? 'span') as ElementType;
  const { t, td } = useLocaleCurrency();
  const inline = useInlineTranslationOptional();

  const text = dynamic
    ? td(dynamic.entityType, dynamic.entityId, dynamic.field, fallback)
    : t(tKey ?? '', fallback);

  const canEdit = inline?.canEdit ?? false;
  const editMode = inline?.editMode ?? false;

  const mergedClass = className || undefined;
  const title =
    editMode && canEdit
      ? dynamic
        ? `Sửa: ${dynamic.entityType}/${dynamic.entityId}/${dynamic.field}`
        : `Sửa: ${tKey}`
      : undefined;

  const i18nAttrs = dynamic
    ? {
        'data-i18n-dynamic': encodeDynamicAttr(dynamic),
        'data-i18n-fallback': fallback,
        ...(hint ? { 'data-i18n-hint': hint } : {}),
      }
    : tKey
      ? { 'data-i18n-key': tKey, 'data-i18n-fallback': fallback, ...(hint ? { 'data-i18n-hint': hint } : {}) }
      : {};

  return (
    <Tag {...rest} {...i18nAttrs} className={mergedClass} title={title}>
      {text}
    </Tag>
  );
}
