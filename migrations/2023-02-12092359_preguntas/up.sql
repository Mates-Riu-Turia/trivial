CREATE TABLE `preguntas` (
  `codi_pregunta` int(11) NOT NULL PRIMARY KEY,
  `assignatura` text NOT NULL,
  `nivell` int(11) NOT NULL,
  `text` text NOT NULL,
  `no_mostrar` int(11) NOT NULL DEFAULT 0,
  `respostes` text NOT NULL,
  `intents` int(11) NOT NULL,
  `temps` int(11) NOT NULL,
  `imatge` text NOT NULL,
  `data` datetime NOT NULL DEFAULT current_timestamp(),
  `verificada` int(11) NOT NULL DEFAULT 0,
  `modificada` int(11) NOT NULL DEFAULT 0
)DEFAULT CHARSET=utf8mb4;
