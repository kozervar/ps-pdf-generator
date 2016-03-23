import { Router } from 'express';
import facets from './facets';
import products from './products';
import fakeproducts from './fakeproducts';

export default function() {
	var api = Router();

	// mount the facets resource
	api.use('/facets', facets);
	api.use('/product', products);
	api.use('/fakeproduct', fakeproducts);

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({
			version : '1.0'
		});
	});

	return api;
}
