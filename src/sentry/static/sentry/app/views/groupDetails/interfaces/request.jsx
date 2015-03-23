/*** @jsx React.DOM */

var React = require("react");

var GroupEventDataSection = require("../eventDataSection");
var PropTypes = require("../../../proptypes");

var RequestInterface = React.createClass({
  propTypes: {
    group: PropTypes.Group.isRequired,
    event: PropTypes.Event.isRequired,
    type: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired
  },

  render: function(){
    var group = this.props.group;
    var evt = this.props.event;
    var data = this.props.data;

    var fullUrl = data.url;
    if (data.query_string) {
      fullUrl = fullUrl + '?' + data.query_string;
    }
    if (data.fragment) {
      fullUrl = fullUrl + '#' + data.fragment;
    }

    var headers = [];
    for (var key in data.headers) {
      headers.push(<dt key={'dt-' + key }>{key}</dt>);
      headers.push(<dd key={'dd-' + key }>{data.headers[key]}</dd>);
    }

    return (
      <GroupEventDataSection
          group={group}
          event={evt}
          type={this.props.type}
          title="Request">
        <table className="table vars">
          <colgroup>
            <col style={{width: "130"}} />
          </colgroup>
          <tbody>
            <tr>
              <th>URL:</th>
              <td><a href={fullUrl}>{data.url}</a></td>
            </tr>
            {data.method &&
              <tr>
                  <th>Method</th>
                  <td>{data.method}</td>
              </tr>
            }
            {data.query_string &&
              <tr>
                <th>Query:</th>
                <td className="values">
                  <pre>{data.query_string}</pre>
                </td>
              </tr>
            }
            {data.fragment &&
              <tr>
                <th>Fragment:</th>
                <td className="values">
                  <pre>{data.fragment}</pre>
                </td>
              </tr>
            }
            {data.data &&
              <tr>
                <th>Body:</th>
                <td className="values">
                  <pre>{JSON.stringify(data.body, null, 2)}</pre>
                </td>
              </tr>
            }
            {data.cookies &&
              <tr>
                <th>Cookies:</th>
                <td className="values">
                  <pre>{JSON.stringify(data.cookies, null, 2)}</pre>
                </td>
              </tr>
            }
            {headers &&
              <tr>
                <th>Headers:</th>
                <td className="values">
                  <dl>
                    {headers}
                  </dl>
                </td>
              </tr>
            }
            {data.env &&
              <tr>
                <th>Environment:</th>
                <td className="values">
                  <pre>{JSON.stringify(data.env, null, 2)}</pre>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </GroupEventDataSection>
    );
  }
});

module.exports = RequestInterface;