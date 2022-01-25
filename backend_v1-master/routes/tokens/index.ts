import { Router } from 'express';
import { Token } from '../../database';
import { password as configPassword } from '../../config';
const router = Router();

router.post('/add', async (req, res, next) => {
  const ticker = req.body.ticker as string | undefined;
  const name = req.body.name as string | undefined;
  const logo = req.body.logo as string | undefined;
  const password = req.body.password as string | undefined;
  const description = req.body.description as string | undefined;
  const precision = req.body.precision as number | undefined;
  const addresses =
    (req.body.addresses as { chainId: Number; value: String }[]) || [];

  if (
    !ticker ||
    !name ||
    addresses.length === 0 ||
    password !== configPassword
  ) {
    return res.status(400).send('Invalid parameters');
  }

  const token = new Token({
    ticker,
    name,
    logo,
    description,
    addresses,
    precision,
  });

  try {
    await token.save();
    res.status(200).send('Success');
  } catch (ex) {
    console.log(`Error while creating a token: ${ex}`);
    res.status(500).send(ex);
  }
});

// router.post('/remove', (req, res, next) => {

// });

export { router as tokensRouter };
