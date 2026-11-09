
import "./FlyingBees.css";

export default function FlyingBees() {
  return (
    <div className="bee-flight-layer" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((bee) => (
        <span className={`flying-bee bee-${bee}`} key={bee}>
          <span className="bee-wing wing-left" />
          <span className="bee-wing wing-right" />
          <span className="bee-body" />
          <span className="bee-head" />
          <span className="bee-stinger" />
        </span>
      ))}
    </div>
  );
}
