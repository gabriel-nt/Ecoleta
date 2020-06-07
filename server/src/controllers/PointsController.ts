import {Request, Response} from 'express';
import knex from '../database/connection';

export default class PointsController{
    async index(request:Request, response:Response) {
        const {city, uf, items} = request.query;
        const default_url = 'http://192.168.0.162:3333/uploads/'

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .orWhere('city', String(city))
            .orWhere('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: default_url + point.image
            }
        })

        return response.json(serializedPoints);
    }

    async show(request:Request, response:Response) {
        const {id} = request.params;
        const default_url = 'http://192.168.0.162:3333/uploads/'

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return response.status(400).json({message: 'Point not found'});
        } 

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id);

        const serializedPoint = {
            ...point,
            image_url: default_url + point.image
        }

        return response.json({point: serializedPoint, items});
    }

    async create(request:Request, response:Response) {
        const {
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf, 
            items
        } = request.body;
    
        // Inicializa a transaction
        const trx = await knex.transaction();

        const point = {
            image: request.file.filename,
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };
    
        const lastInsertId = await trx('points').insert(point);
    
        const point_id =  lastInsertId[0];

        console.log(items);
    
        const points_items = items
            .split(',')
            .map((item:string) => Number(item.trim()))
            .map((item_id: number) => {
            return {
                item_id,
                point_id: point_id
            }
        });
    
        await trx('point_items').insert(points_items);

        // Commit para sucesso
        // Rollback para erro
        await trx.commit();
    
        return response.json({
            id: point_id,
            ...point
        });
    }
}