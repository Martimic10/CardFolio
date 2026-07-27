import Image from "next/image";
import styles from "./CatalogCard.module.css";

export function CatalogCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.tab}>CF-0142</div>

      <div className={styles.photo}>
        <Image
          src="/kengriffey.jpg"
          alt="Ken Griffey Jr. 1989 Upper Deck"
          fill
          sizes="(max-width: 759px) 260px, 300px"
          className={styles.photoImg}
          priority
        />
      </div>

      <dl className={styles.fields}>
        <div className={styles.row}>
          <dt>Player</dt>
          <dd>Ken Griffey Jr.</dd>
        </div>
        <div className={styles.row}>
          <dt>Set</dt>
          <dd>1989 Upper Deck #1</dd>
        </div>
        <div className={styles.row}>
          <dt>Condition</dt>
          <dd>NM-MT · Est. 8.5</dd>
        </div>
        <div className={styles.row}>
          <dt>Market</dt>
          <dd className={styles.price}>$184.00</dd>
        </div>
      </dl>

      <div className={styles.stamp}>verified · 94%</div>
    </div>
  );
}
