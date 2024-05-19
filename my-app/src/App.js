import React, { useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Card, Row, Col } from 'antd';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [saltSuggestions, setSaltSuggestions] = useState([]);
  const [selectedSalt, setSelectedSalt] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedStrength, setSelectedStrength] = useState(null);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showMoreForms, setShowMoreForms] = useState(false);

  const handleSearch = async () => {
    const response = await fetch(`https://backend.cappsule.co.in/api/v1/new_search?q=${searchTerm}&pharmacyIds=1,2,3`);
    const data = await response.json();
    setSaltSuggestions(data.data.saltSuggestions);
  
    if (data.data.forms && data.data.forms.length === 1) {
      setSelectedForm(data.data.forms[0]);
    } else {
      setSelectedForm(null); 
    }
  };
  
  const handleSaltSelect = (salt) => {
    setSelectedSalt(salt);
    setSelectedForm(salt.available_forms[0]);
    setSelectedStrength(salt.most_common.Strength);
    setSelectedPacking(salt.most_common.Packing);
  };

  const handleFormSelect = (form) => setSelectedForm(form);

  const handleStrengthSelect = (strength) => setSelectedStrength(strength);

  const handlePackingSelect = (packing) => setSelectedPacking(packing);

  const getPrice = (salt) => {
    if (salt && selectedForm && selectedStrength && selectedPacking) {
      const product = salt.salt_forms_json[selectedForm]?.[selectedStrength]?.[selectedPacking];
      if (product) {
        const lowestPrice = Object.values(product)
          .filter(Boolean)
          .reduce((min, p) => (p.selling_price < min ? p.selling_price : min),80);
        return <p className="price-from">From: {lowestPrice}</p>;
      } else {
        return  <div className="no-stores-container">
          <p>No stores selling this product near you</p>
        </div>
      }
    }
    return null;
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleShowMoreForms = () => setShowMoreForms(!showMoreForms);

  return (
    <div className="medicen">
      <div className="medicen app">
        <div className="search-crypto">
          <div className="search-container">
            <span className="search-icon">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Type your medicine name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                onKeyDown={handleKeyDown}
              />
              <span className="search-text" onClick={handleSearch}>search</span>
            </div>
          </div>
        </div>
      </div>
      <Row gutter={[32, 32]} className="medicen-card-container">
        {saltSuggestions.map((salt) => (
          <Col
            xs={24}
            sm={12}
            lg={6}
            className="medicen-card"
            key={salt.id}
          >
            <Card
              className={selectedSalt && selectedSalt.id === salt.id ? "gradient-card selected" : "gradient-card"}
              onClick={() => handleSaltSelect(salt)}
            >
              <p>{salt.name}</p>
              <p>Form: <button type="button" class="btn btn-outline-dark"> 
                {selectedSalt && selectedSalt.id === salt.id ? (
                  <span className="form-option">{selectedForm}</span>
                ) : (
                  <>
                    {(showMoreForms || salt.available_forms.length <= 3) ? (
                      salt.available_forms.map(form => (
                        <span
                          key={form}
                          className="form-option"
                          onClick={() => handleFormSelect(form)}
                        >
                          {form}
                        </span>
                      ))
                    ) : (
                      <>
                        {salt.available_forms.slice(0, 5).map(form => (
                          <span
                            key={form}
                            className="form-option"
                            onClick={() => handleFormSelect(form)}
                          >
                            {form}
                          </span>
                        ))}
                        <button className="more-button" onClick={toggleShowMoreForms}>More</button>
                      </>
                    )}
                  </>
                )}</button>
              </p>
              <p>Strength: <button  class="btn btn-outline-dark">  
                {selectedSalt && selectedSalt.id === salt.id ? (
                  <span className="strength-option">{selectedStrength}</span>
                ) : (
                  <span className="strength-option">{salt.most_common.Strength}</span>
                )}</button>
              </p>
              <p>Packaging: <button type="button" class="btn btn-outline-dark"> 
                {selectedSalt && selectedSalt.id === salt.id ? (
                  <span className="packing-option">{selectedPacking}</span>
                ) : (
                  <span className="packing-option">{salt.most_common.Packing}</span>
                )}</button>
              </p>
              <span className="price">
                {getPrice(salt)}
              </span>
              {selectedSalt && selectedSalt.id === salt.id && (
                <div className="selected-options">
                  <> 
                    <p>{selectedForm}|{selectedStrength}|{selectedPacking}</p>
                  </>
                </div>
              )}
              
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default App;
