-- Insert exam data based on the provided files
INSERT INTO exams (title, description, questions, total_questions) VALUES
(
    'Prova de Gás e Encanamento - Nível 1',
    'Prova com 80 questões sobre regulamentações de gás e encanamento',
    '[
        {
            "number": 1,
            "question": "At what pressure does gas piping need to be welded?",
            "options": {
                "a": "Over ½ PSI",
                "b": "Over 2 PSI", 
                "c": "Over 4 PSI",
                "d": "Over 5 PSI"
            },
            "answer": "d"
        },
        {
            "number": 2,
            "question": "Elevated pressure gas piping must be labeled at?",
            "options": {
                "a": "a minimum of every six feet",
                "b": "a minimum of every eight feet",
                "c": "a minimum of every ten feet",
                "d": "a minimum of every twelve feet"
            },
            "answer": "c"
        },
        {
            "number": 3,
            "question": "When gas is above what pressure is it no longer considered to be low pressure?",
            "options": {
                "a": "0.5 P.S.I.G",
                "b": "1 P.S.I.G",
                "c": "2 P.S.I.G",
                "d": "5 P.S.I.G"
            },
            "answer": "a"
        }
    ]'::jsonb,
    80
),
(
    'Prova de Encanamento - Nível 2', 
    'Prova com 81 questões sobre códigos de encanamento',
    '[
        {
            "number": 1,
            "question": "When Testing the Water Distribution System, you must test the system to a pressure of",
            "options": {
                "a": "10 PSI",
                "b": "125 PSI",
                "c": "3 PSI",
                "d": "5 PSI"
            },
            "answer": "b"
        },
        {
            "number": 2,
            "question": "Waste outlets serving shower stalls and compartments that are not part of bathtubs shall be no less than in diameter.",
            "options": {
                "a": "3\"",
                "b": "1 1/2\"",
                "c": "1 1/4\"",
                "d": "2\""
            },
            "answer": "d"
        }
    ]'::jsonb,
    81
),
(
    'Prova Avançada de Encanamento',
    'Prova com 84 questões avançadas sobre sistemas de encanamento',
    '[
        {
            "number": 1,
            "question": "An electric water heater installed in a commercial application having a storage capacity of over 120 gallons must have:",
            "options": {
                "a": "a safe waste pan installed",
                "b": "a dedicated cold water feed from the water meter",
                "c": "an ASME rating",
                "d": "recovery rate of at least 30 GPM"
            },
            "answer": "c"
        }
    ]'::jsonb,
    84
),
(
    'Prova Técnica Especializada',
    'Prova com 80 questões técnicas especializadas',
    '[
        {
            "number": 1,
            "question": "Vents for the floor/trough drain(s) in facilities served by a gasoline, oil and sand separator may connect to the chamber vent of the separator",
            "options": {
                "a": "Never, must run independent through the roof",
                "b": "No less than six inches above the flood level rim ofthe drain it serves",
                "c": "No less than 12\" above the chamber ofthe interceptor",
                "d": "No limitations"
            },
            "answer": "b"
        }
    ]'::jsonb,
    80
);
