/**
 * Tên sản phẩm: tối đa 2 dòng, ellipsis, xuống dòng cả chuỗi không có khoảng trắng.
 */
export function ClampedProductName({
  name,
  className = '',
}: {
  name: string;
  className?: string;
}) {
  return (
    <p
      className={`line-clamp-2 overflow-hidden break-all text-sm font-medium leading-snug [overflow-wrap:anywhere] ${className}`}
      title={name}
    >
      {name}
    </p>
  );
}
