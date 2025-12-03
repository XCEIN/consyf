import ContactsSection from './contacts-section';
import ChannelsSection from './channels-section';
import PartnersSection from './partners-section';

export const metadata = {
  title: 'Liên hệ với chúng tôi | CONSYF',
  description: 'Kết nối với CONSYF qua các kênh liên hệ dưới đây',
};

export default function AboutPage() {
  return (
    <section>
      <ChannelsSection />
      <ContactsSection />
      <PartnersSection />
    </section>
  );
}
