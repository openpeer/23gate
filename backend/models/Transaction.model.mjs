import { Sequelize, Model } from 'sequelize'

export class Transaction extends Model {
  static structure = {
    chainId: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      // chainId is not part of the primary key because we fully expect tx hash to be unique enough.
    },

    transactionHash: {
      type: Sequelize.DataTypes.TXHASH,
      allowNull: false,
      primaryKey: true,
      get() {
        return '0x' + this.getDataValue('transactionHash').toString('hex')
      },
    },

    blockNumber: {
      type: Sequelize.DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    transactionIndex: {
      type: Sequelize.DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
    },

    json: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
    },
  }

  static async destroyTransactionsByHashList(transactionHash, transaction) {
    await this.destroy({
      where: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('transactionHash')),
        Sequelize.fn('lower', transactionHash)
      ),
      transaction,
    })
  }

  static async findTransactionsToParseByChainId(chainId, limit = 30) {
    return await this.findAll({
      where: {
        chainId,
      },
      order: [
        // we must sort in order to put sorted into Payload table as they are delivered sequentially
        ['blockNumber', 'asc'],
        ['transactionIndex', 'asc'],
      ],
      limit,
    })
  }

  static async ingestReceiptsForChainId(receipts, chainId, transaction) {
    const records = receipts.map(
      (receipt) =>
        '(' +
        [
          this.sequelize.escape(chainId),
          receipt.transactionHash,
          this.sequelize.escape(receipt.blockNumber),
          this.sequelize.escape(receipt.transactionIndex),
          this.sequelize.escape(JSON.stringify(receipt)),
        ].join(', ') +
        ')'
    )

    await this.sequelize.query(
      `INSERT IGNORE INTO Transaction (chainId, transactionHash, blockNumber, transactionIndex, json) VALUES ${records}`,
      {
        transaction,
        type: Sequelize.QueryTypes.UPDATE,
      }
    )
  }

  static options = {
    timestamps: false,

    indexes: [
      {
        fields: ['chainId'],
      },
      {
        fields: ['blockNumber', 'transactionIndex'],
      },
      {
        fields: ['chainId', 'blockNumber', 'transactionIndex'],
      },
    ],
  }
}
