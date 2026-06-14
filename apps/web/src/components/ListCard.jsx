import { Link } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

export function ListCard({ list, variant = 'home' }) {
  const content = (
    <>
      <div className="list-card__media">
        <img alt={list.title} src={list.image} />
        {list.privacy ? (
          <div className="list-card__privacy">
            <MaterialIcon filled name="lock" />
            <span>{list.privacy}</span>
          </div>
        ) : null}
        {list.visibility ? <span className="list-card__visibility">{list.visibility}</span> : null}
        {list.collaborators?.length ? (
          <div className="list-card__collaborators">
            {list.collaborators.slice(0, 2).map((avatar, index) => (
              <img key={`${list.id}-collab-${index + 1}`} alt="" src={avatar} />
            ))}
            {list.extraCount ? <div>+{list.extraCount}</div> : null}
          </div>
        ) : null}
      </div>
      <div className="list-card__details">
        <h3>{list.title}</h3>
        <p>{list.items} itens</p>
        {variant === 'lists' && list.updated ? <p>{list.updated}</p> : null}
      </div>
    </>
  );

  return (
    <Link
      className={`list-card list-card--${variant}`}
      to={list.to ?? `/lists/${list.id}`}
    >
      {content}
    </Link>
  );
}
