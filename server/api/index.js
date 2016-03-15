import { Router } from 'express';
import facets from './facets';
import products from './products';

export default function() {
	var api = Router();

	// mount the facets resource
	api.use('/facets', facets);
	api.use('/product', products);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({
			version : '1.0'
		});
	});

	return api;
}
