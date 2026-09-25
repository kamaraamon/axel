"use client";

import { motion } from "framer-motion";

const compartments = [6500, 6500, 6500, 6500, 6500, 6500, 6000];

export function TankVisual({ critical = false }: { critical?: boolean }) {
  const total = critical ? 43000 : 45000;
  return (
    <div className="tank-wrap" aria-label={`Citerne à ${total.toLocaleString("fr-FR")} litres`}>
      <div className="tank-title">
        <span>CI 01 AB 4521 · 7 compartiments</span>
        <strong className={critical ? "danger-text" : ""}>
          {total.toLocaleString("fr-FR")} L
        </strong>
      </div>
      <div className="tank-shell">
        {compartments.map((capacity, index) => {
          const loss = critical && index === 3 ? 2000 : 0;
          const fill = ((capacity - loss) / capacity) * 100;
          return (
            <div className="tank-compartment" key={index}>
              <motion.div
                className={loss ? "fuel-level fuel-danger" : "fuel-level"}
                initial={false}
                animate={{ height: `${fill}%` }}
                transition={{ duration: 0.8 }}
              />
              <span>C{index + 1}</span>
              <small>{(capacity - loss).toLocaleString("fr-FR")} L</small>
            </div>
          );
        })}
      </div>
      <div className="tank-wheels"><i /><i /></div>
    </div>
  );
}
