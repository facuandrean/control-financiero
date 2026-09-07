import React from "react";

import "./selectionMenu.css";
import { Loading } from "../../ui";

// Usamos <T> para indicar que es un tipo genérico (puede ser Account, Category, etc.)
interface SelectionMenuProps<T> {
  items: T[];
  // Función para obtener el ID único de cada ítem
  keyExtractor: (item: T) => string;
  // Función que dicta cómo se debe dibujar el componente
  renderItem: (item: T) => React.ReactNode;
  // Mensaje a mostrar si el array está vacío
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
}

export const SelectionMenu = <T,>({ 
  items, 
  keyExtractor, 
  renderItem, 
  emptyMessage = "No hay elementos para mostrar.", 
  isLoading = false,
  className = "" 
}: SelectionMenuProps<T>) => {
  return (
    <div className={`selection-menu ${className}`}>
      {isLoading ? (
        <div className="loading-center">
          <Loading />
        </div>
      ) : items.length > 0 ? (
        items.map((item) => (
          <React.Fragment key={keyExtractor(item)}>
            {renderItem(item)}
          </React.Fragment>
        ))
      ) : (
        <p className="empty-msg">{emptyMessage}</p>
      )}
    </div>
  );
};