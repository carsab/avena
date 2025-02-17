odoo.define('custom_receipts_for_pos.receipt',function(require){
    "use strict"
    var models=require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');
    var PosDB = require("point_of_sale.DB");
    const OrderReceipt = require('point_of_sale.OrderReceipt');
    const AbstractReceiptScreen = require('point_of_sale.AbstractReceiptScreen');
    var SuperOrder = models.Order;

     PosDB.include({
        init:function(options){
            var self=this;this._super(options);
            this.receipt_design=null;
            },
        })
    const PosResOrderReceipt = OrderReceipt =>
        class extends OrderReceipt {
            get receiptEnv() {
                let receipt_render_env = super.receiptEnv;
                let receipt = receipt_render_env.receipt;
                console.log(receipt, 'receipt')
                var self=this;
                if(self.env.pos.config.is_custom_receipt){
                    var receipt_design=self.env.pos.config.design_receipt
                    var order=self._receiptEnv.order;
                    var data={
                        widget:self.env,
                        pos:order.pos,
                        order:order,
                        receipt:order.export_for_printing(),
                        orderlines:order.get_orderlines(),
                        paymentlines:order.get_paymentlines(),
                        moment:moment,
                        };
                        console.log(data, 'data')
                    var parser=new DOMParser();
                    var xmlDoc=parser.parseFromString(receipt_design,"text/xml");
                    var s=new XMLSerializer();

                    var newXmlStr=s.serializeToString(xmlDoc);
                    var qweb=new QWeb2.Engine();
                    qweb.add_template('<templates><t t-name="receipt_design">'+newXmlStr+'</t></templates>');
                    receipt=qweb.render('receipt_design',data);$('div.pos-receipt').replaceWith(receipt);
                    return receipt_render_env;
                    }
                return receipt_render_env;
                }
            }
    Registries.Component.extend(OrderReceipt, PosResOrderReceipt)
    return OrderReceipt
});