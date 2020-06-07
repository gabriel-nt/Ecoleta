import {Request, Response} from 'express';
import knex from '../database/connection';

export default class ItemsController{
    async index(request:Request, response:Response) {
        const default_url = 'http://192.168.0.162:3333/uploads/'
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: default_url + item.image
            }
        })
    
        return response.json(serializedItems);
    }
}