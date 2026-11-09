import { collections, minimumQuantity, phone, whatsappContact } from "../lib/catalog";
import Tactile from "./Tactile";
import Icon from "./Icon";
import BrandMark from "./BrandMark";

export default function Footer({ onBrowse }) {
  return (
    <footer className="footer" id="contact">
      <div className="shell">
        <div className="footer-invite">
          <div>
            <p className="eyebrow text-gold">Personal &amp; bulk gifting</p>
            <h2>Give something worth remembering.</h2>
          </div>
          <Tactile as="a" magnetic className="gold-button" href={whatsappContact}>
            <Icon name="chat" /> Talk to us on WhatsApp
          </Tactile>
        </div>
      </div>
      <div className="shell footer-grid">
        <div>
          <Tactile as="a" magnetic className="brand" href="#"><BrandMark /><span>Varnam<small>G I F T S</small></span></Tactile>
          <p className="mt-5 max-w-xs text-sm leading-7">Thoughtful gifts for celebrations, personal milestones and corporate occasions. Minimum order: {minimumQuantity} items per product.</p>
        </div>
        <div>
          <h2 className="eyebrow text-ink">Shop collections</h2>
          <ul>{collections.map(({ id, title }) => <li key={id}><Tactile as="a" magnetic href={`#${id}`} onClick={onBrowse}>{title}</Tactile></li>)}</ul>
        </div>
        <div>
          <h2 className="eyebrow text-ink">Speak with us</h2>
          <address className="not-italic">
            <ul>
              <li><Tactile as="a" magnetic href={whatsappContact}>WhatsApp · {phone}</Tactile></li>
              <li><Tactile as="a" magnetic href="/">Visit the Varnam Gifts homepage</Tactile></li>
            </ul>
          </address>
        </div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getUTCFullYear()} Varnam Gifts</span><Tactile as="a" magnetic href="#">Back to top ↑</Tactile></div>
    </footer>
  );
}
