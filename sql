CREATE TABLE caixa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  os VARCHAR(255),
  credit DECIMAL(10,2) DEFAULT 0,
  debit DECIMAL(10,2) DEFAULT 0,
  obs_debito VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE os (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  numero_os VARCHAR(255),
  liberou VARCHAR(255),
  levou VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar o campo updated_at na tabela caixa
DELIMITER //
CREATE TRIGGER update_caixa_timestamp
BEFORE UPDATE ON caixa
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Trigger para atualizar o campo updated_at na tabela os
DELIMITER //
CREATE TRIGGER update_os_timestamp
BEFORE UPDATE ON os
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;
