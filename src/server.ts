import express from 'express';
import { PrismaClient } from "@prisma/client";


const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_, res) => {
    const movies = await prisma.movies.findMany({
        include: {
            genres: true,
            languages: true,
        },
        orderBy: {
            title: "asc",
        },

    });
    res.json(movies);
});


app.post('/movies', async (req, res) => {

    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {
        const movieWithSameTitle = await prisma.movies.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" }
            },
        });

        if (movieWithSameTitle) {
            return res.status(409).send({ mensage: "Já existe um filme com esse titulo" });
        }

        await prisma.movies.create({
            data: {
                title: title,
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res.status(500).send({ menssage: "Falha ao cadastrar um filme" });
    };


    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        const movie = await prisma.movies.findUnique({
            where: { id },
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }

        const data = { ...req.body };
        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;

        await prisma.movies.update({ 
            where: { 
                id 
            },
            data 
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o registro" });
    }

});

app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movies.findUnique({
            where: { id }
        })

        if(!movie){
            return res.status(404).send({ message: 'Filme não encontrado'});

        }
        await prisma.movies.delete({where: {id}});
    }catch(error){
        res.status(500).send({message: 'Falha ao remover o registro'});
    }

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
})