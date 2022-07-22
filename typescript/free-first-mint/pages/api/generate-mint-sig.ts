import type { NextApiRequest, NextApiResponse } from "next";
import { table } from "../../utils/Airtable";
import sdk from "../../utils/thirdweb";

const generateMintSignature = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { address, quantity } = JSON.parse(req.body);

  console.log((quantity - 1) * 2);

  const drop = sdk.getSignatureDrop(
    "0x6d148a12f7c0ae693609F5a26E085646f8F73A53"
  );

  const record = await table
    .select({
      fields: ["address", "hasClaimed"],
      filterByFormula: `NOT({address} != '${address}')`,
    })
    .all();

  const determinePrice = (): number => {
    if (record[0]?.fields?.hasClaimed) {
      return quantity * 2;
    }
    return (quantity - 1) * 2;
  };

  try {
    const signedPayload = await drop.signature.generate({
      to: address,
      price: determinePrice(),
      quantity,
    });

    return res.status(200).json({
      signedPayload: signedPayload,
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

export default generateMintSignature;
