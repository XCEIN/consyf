import { Metadata } from 'next';
import PromotionCategoriesSection from './promotion-categories-section';

export const metadata: Metadata = {
  title: 'Danh sách khuyến mãi | CONSYF',
  description: 'Các chương trình khuyến mãi đặc biệt dành cho nhà đầu tư theo từng lĩnh vực',
};

export default function PromotionPage() {
  return (
    <section className="min-h-screen">
      <PromotionCategoriesSection />
    </section>
  );
}
