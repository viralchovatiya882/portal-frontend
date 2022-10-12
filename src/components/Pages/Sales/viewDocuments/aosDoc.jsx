import React from "react";

const AOSDoc = (props) => {
  const productDesc = props.salesOrderState.productDesc || [];
  const additionalCharges = props.salesOrderState.additionalCharges || [];
  const customerDetails = props.salesOrderState.customerDetails;
  const shippingDetails = props.salesOrderState.shippingDetails;
  return (
    <div className="document-view">
      <table style={{ width: "90%", textAlign: "center" }}>
        <tbody>
          <tr style={{ textAlign: "center" }}>
            <td>
              <img
                src={process.env.PUBLIC_URL + "/android-chrome-512x512.png"}
                style={{ height: 260 }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: "center", fontSize: "x-large" }}>
              AGREEMENT OF SALE
            </td>
          </tr>
          <tr>
            <td>
              We hereby have pleasure in confirming your order in accordance
              with the details below. Please can you sign and return by email to
              Duncan Taylor Scotch Whisky Ltd.
            </td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: "80%", textAlign: "center" }}>
        <tbody>
          <tr>
            <td style={{ textAlign: "center" }}>
              <p>
                DT Sales Order<span>E001-01</span>
              </p>
              <p>
                Payment Terms <span>Credit - 60 Days</span>
              </p>
              <p>
                Terms of sale <span>Ex Works</span>
              </p>
              <p>
                Special Conditions <span>Heat Treated Pallets - £33.00</span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: "90%", textAlign: "center" }}>
        <tbody>
          <tr>
            <th>Product Description</th>
            <th>Quantity CS</th>
            <th>Price GBP</th>
          </tr>
          {productDesc.length > 0 &&
            productDesc.map((item, i) => (
              <tr style={{ textAlign: "center" }} key={i}>
                <td>{item.product_description}</td>
                <td>{item.quantity}</td>
                <td>{item.net_price}</td>
              </tr>
            ))}
          {additionalCharges.length > 0 &&
            additionalCharges.map((item, i) => (
              <tr style={{ textAlign: "center" }} key={i}>
                <td>{item.item}</td>
                <td>{item.unit}</td>
                <td>{item.total_cost}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <table style={{ width: "90%", textAlign: "center", marginTop: "100px" }}>
        <tbody>
          <tr>
            <th>Invoicing Address</th>
            <th>Delivery Address</th>
          </tr>
          <tr style={{ textAlign: "center", marginTop: "200px" }}>
            <td>
              <p>{customerDetails.invoice_address}</p>
              <p>{customerDetails.city}</p>
              <p>
                {customerDetails.state + ", " + customerDetails.postal_code}
              </p>
              <p>{customerDetails.country}</p>
            </td>
            <td>
              <p>{shippingDetails.delivery_address}</p>
              <p>{shippingDetails.city}</p>
              <p>
                {shippingDetails.state + ", " + customerDetails.postal_code}
              </p>
              <p>{shippingDetails.country}</p>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ textAlign: "center" }}>To be Completed by Customer</p>
      <table style={{ width: "90%", textAlign: "center" }}>
        <tbody>
          <tr>
            <td>Customer PO No</td>
            <td />
            <td>Excise Reg No </td>
            <td />
          </tr>
          <tr>
            <td>Warehouse No</td>
            <td>CW001</td>
            <td>VAT No</td>
            <td>AHXXP80001</td>
          </tr>
          <tr>
            <td>Contact Name</td>
            <td>Contact Email</td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: "100%", textAlign: "center", marginTop: "100px" }}>
        <tbody>
          <tr>
            <td>LUXURY SCOTCH WHISKY SPECIALISTS</td>
          </tr>
          <tr>
            <td>
              King Street, Huntly, Aberdeenshire, Scotland, AB54 8HP | Tel:
              +44(0)1466 794055 Fax: +(0)1466 794618
            </td>
          </tr>
          <tr>
            <td>
              info@duncantaylor.com | www.duncantaylor.com | Reg No. 36622
              Scotland | Vat Reg No. 260971354
            </td>
          </tr>
        </tbody>
      </table>
      <table
        style={{ width: "90%", textAlign: "center", border: "1px solid black" }}
      >
        <tbody>
          <tr>
            <td style={{ border: "1px solid black" }}>Name of Transporter</td>
            <td style={{ border: "1px solid black" }}>ABC Logistics Pvt Ltd</td>
            <td style={{ border: "1px solid black" }}>Email of Transporter</td>
            <td style={{ border: "1px solid black" }}>
              abclogistics@gmail.com
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black" }}>
              Address of Transporter
            </td>
            <td>
              <p>ABC Logistics</p>
              <p>Kent Street</p>
              <p>Edinburgh, Scotland - 32</p>
            </td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: "90%", height: "200px", marginTop: "100px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black" }}>
              For and on behalf of Duncan Taylor Scotch Whisky Ltd
            </td>
            <td style={{ border: "1px solid black" }}>For and on behalf of</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black" }} />
            <td style={{ border: "1px solid black" }} />
          </tr>
        </tbody>
      </table>
      <table style={{ width: "90%", textAlign: "center", marginTop: "100px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black" }}>
              <h3>TERMS AND CONDITIONS OF SALE</h3>
              <p>
                1.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                vehicula erat vel justo efficitur cursus. Mauris felis augue,
                interdum in pulvinar at, mollis id massa. Donec fermentum
                consectetur nunc et euismod. Ut et augue facilisis, pretium
                lectus at, blandit orci.{" "}
              </p>
              <p>
                1.2 Praesent justo sapien, lobortis vitae felis ut, aliquet
                sollicitudin massa. Fusce eget sodales diam. Ut sagittis lectus
                magna, id tincidunt massa accumsan aliquam. Vivamus id massa
                eget lacus pellentesque vestibulum. Curabitur eu lectus est.
                Nullam ac erat vitae enim finibus facilisis quis sit amet
                tortor. Vestibulum rutrum nibh elit, a fringilla mauris eleifend
                pretium. Sed orci urna, ultrices ut interdum eget, ornare in mi.{" "}
              </p>
              <p>
                1.3 Morbi fermentum consequat sapien in convallis. Curabitur
                vitae viverra nulla, quis elementum lorem. Vestibulum tempor
                ante a mattis tristique.
              </p>
            </td>
            <td style={{ border: "1px solid black" }}>
              <p>
                2.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                vehicula erat vel justo efficitur cursus. Mauris felis augue,
                interdum in pulvinar at, mollis id massa. Donec fermentum
                consectetur nunc et euismod. Ut et augue facilisis, pretium
                lectus at, blandit orci.{" "}
              </p>
              <p>
                2.2 Praesent justo sapien, lobortis vitae felis ut, aliquet
                sollicitudin massa. Fusce eget sodales diam. Ut sagittis lectus
                magna, id tincidunt massa accumsan aliquam. Vivamus id massa
                eget lacus pellentesque vestibulum. Curabitur eu lectus est.
                Nullam ac erat vitae enim finibus facilisis quis sit amet
                tortor. Vestibulum rutrum nibh elit, a fringilla mauris eleifend
                pretium. Sed orci urna, ultrices ut interdum eget, ornare in mi.{" "}
              </p>
              <p>
                2.3 Morbi fermentum consequat sapien in convallis. Curabitur
                vitae viverra nulla, quis elementum lorem. Vestibulum tempor
                ante a mattis tristique.
              </p>
            </td>
            <td style={{ border: "1px solid black" }}>
              <p>
                3.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                vehicula erat vel justo efficitur cursus. Mauris felis augue,
                interdum in pulvinar at, mollis id massa. Donec fermentum
                consectetur nunc et euismod. Ut et augue facilisis, pretium
                lectus at, blandit orci.{" "}
              </p>
              <p>
                Order No <span>/orderNo/</span>
              </p>
              <p>
                Order Date <span>/orderDate/</span>
              </p>
              <p>
                We hereby accept the terms and conditions set by Duncan Taylor
                in relation to the above order
              </p>
              <p>
                Signed <span>/sign1/</span>
              </p>
              <p>
                Date <span>/date2/</span>
              </p>
              <table
                style={{
                  textAlign: "center",
                  width: "100%",
                  marginTop: "100px",
                }}
              >
                <tbody>
                  <tr></tr>
                  <tr></tr>
                  <tr></tr>
                  <tr></tr>
                  <tr></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <h3 style={{ marginTop: "3em" }}>
        Agreed: <span style={{ color: "white" }}>**signature_1**/</span>
      </h3>
    </div>
  );
};
export default AOSDoc;
