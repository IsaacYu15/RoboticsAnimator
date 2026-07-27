CREATE TABLE animation_events (
  id            SERIAL PRIMARY KEY,
  animation_id  INTEGER NOT NULL,
  component_id  INTEGER NOT NULL,
  trigger_time  DOUBLE PRECISION NOT NULL,
  action        VARCHAR(255) NOT NULL,
  easing        VARCHAR(255) DEFAULT '0,0,1,1',
  CONSTRAINT fk_animation_id
    FOREIGN KEY (animation_id) REFERENCES animations(id)
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT fk_component_id
    FOREIGN KEY (component_id) REFERENCES components(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);