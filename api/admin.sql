-- Query para criar um usuário admin@email.com com senha 'senha'
INSERT INTO users (email, credential, name, role)
VALUES (
  'admin@email.com',
  '$2a$06$4beoXeyTxLmjELZqu1yLt.Vn613jU1EEFDhC1e5/2OZos0XrnJz2C',
  'admin',
  'admin'
);