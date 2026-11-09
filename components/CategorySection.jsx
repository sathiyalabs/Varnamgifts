import { whatsappContact } from "../lib/catalog";
import SplitHeading from "./SplitHeading";
import ProductCard3D from "./ProductCard3D";
import Tactile from "./Tactile";
import Icon from "./Icon";

export default function CategorySection({ collection, showBulk }) {
  return (
    <section id={collection.id} aria-labelledby={`title-${collection.id}`}
      className={`collection theme-${collection.id}`}>
      {collection.legacyId && <span id={collection.legacyId} className="collection-alias" aria-hidden="true" />}
      <div className="section-atmosphere" data-section-atmosphere aria-hidden="true" />
      <div className="shell collection-inner">
        <div data-collection-heading className="collection-heading">
          <div>
            <p className="eyebrow" data-heading-detail>SHOP THE COLLECTION</p>
            <SplitHeading id={`title-${collection.id}`} text={collection.title} />
          </div>
          <p data-heading-detail>{collection.subtitle}</p>
        </div>
        <div className="product-grid" data-reveal-grid>
          {collection.products.map((product) => (
            <div key={product.name}>
              <ProductCard3D product={product} collection={collection.title} />
            </div>
          ))}
          {showBulk && <div className="bulk-tile">
            <Icon name="gift" size={30} />
            <p className="eyebrow">FOR YOUR OCCASION</p>
            <h3>Need gifts in bulk?</h3>
            <p>Ask about quantities, pricing and availability.</p>
            <Tactile as="a" className="gold-button" href={whatsappContact}>
              Talk to us <Icon name="arrow" size={16} />
            </Tactile>
          </div>}
        </div>
      </div>
    </section>
  );
}
